import readline from "node:readline";

import { openai } from "../lib/client.js";
import { sysLog } from "../lib/syslog.js";

// With readline we write text in our terminal (stdin) and and see text output (stdout).
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const newMessage = async (history, message) => {
	const chatCompletion = await openai.chat.completions.create({
		messages: [...history, message],
		model: "gpt-3.5-turbo",
	});

	return chatCompletion.choices[0].message;
};

const formatMessage = (userInput) => ({ role: "user", content: userInput });

// This is the initial origin story for the Ai assistant.
const systemMessage = {
	role: "system",
	content: "You are a helpful assistant, answer any question.",
};

const mainChat = async () => {
	const history = [systemMessage];

	const start = () => {
		rl.question("You: ", async (userInput) => {
			if (userInput.toLowerCase() === "exit") {
				sysLog("OpenAi", "Exiting chat, Goodbye!", "red");
				rl.close();
				return;
			}
			// Format the user input into a message object and keep everything said thus far in history.
			const userMessage = formatMessage(userInput);
			const responseMessage = await newMessage(history, userMessage);

			history.push(userMessage, responseMessage);
			sysLog("OpenAi", `Ai: ${responseMessage.content}`, "green");
			// Recursive call to continue the chat
			start();
		});
	};
	// Initiate the start of the chat
	start();
};

sysLog("OpenAi", "Chatbot initialized. Type 'exit' to quit.", "green");
mainChat();
