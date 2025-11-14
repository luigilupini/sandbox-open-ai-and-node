import { openai } from "../lib/client.js";

const results = await openai.chat.completions.create({
	model: "gpt-3.5-turbo",
	messages: [
		{
			role: "system",
			content: "You are a helpful assistant, answer any question.",
		},
		{
			role: "user",
			content:
				"Say hello in the top european languages, exclude russian because its not part of europe",
		},
	],
});

try {
	console.log("Response:", results.choices[0].message.content);
} catch (error) {
	console.error("Error:", error);
}
