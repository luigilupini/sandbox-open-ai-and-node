import "dotenv/config";
import math from "advanced-calculator";
import { openai } from "../lib/client.js";

const QUESTION = process.argv[2] || "hi";

const messages = [{ role: "user", content: QUESTION }];

// 1. Define tools instead of `functions`
const tools = [
	{
		type: "function",
		function: {
			name: "calculate",
			description: "Run a math expression",
			parameters: {
				type: "object",
				properties: {
					expression: {
						type: "string",
						description:
							'The math expression to evaluate like "2 * 3 + (21 / 2) ^ 2"',
					},
				},
				required: ["expression"],
			},
		},
	},
];

// 2. Local tool implementations
const toolHandlers = {
	calculate: async ({ expression }) => {
		return math.evaluate(expression);
	},
};

// 3. Wrapper to call OpenAI with tools
const getCompletion = async (messages) => {
	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages,
		tools,
		tool_choice: "auto",
		temperature: 0,
	});
	return response;
};

let response;
while (true) {
	response = await getCompletion(messages);

	const choice = response.choices[0];
	const message = choice.message;

	// If the model just replies normally, we're done
	if (!message.tool_calls || message.tool_calls.length === 0) {
		console.log(message.content);
		break;
	}

	// 4. Model decided to call one or more tools
	// First, store the assistant message with tool_calls
	messages.push(message);

	// Then execute each tool call and push tool results
	for (const toolCall of message.tool_calls) {
		const functionName = toolCall.function.name;
		const argsJson = toolCall.function.arguments || "{}";

		const handler = toolHandlers[functionName];

		if (!handler) {
			console.error(`No handler found for tool: ${functionName}`);
			continue;
		}

		let args;
		try {
			args = JSON.parse(argsJson);
		} catch (err) {
			console.error("Failed to parse tool arguments:", err);
			continue;
		}

		// IMPORTANT: await the async handler
		const result = await handler(args);

		// Tool result message
		messages.push({
			role: "tool",
			tool_call_id: toolCall.id,
			name: functionName,
			content: JSON.stringify({ result }),
		});
	}

	// Loop continues: we’ll call the model again with the original messages +
	// tool outputs, until it returns a final answer.
}
