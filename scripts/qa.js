import "dotenv/config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { YoutubeLoader } from "langchain/document_loaders/web/youtube";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { openai } from "../lib/client.js";
import { sysLog } from "../lib/syslog.js";

// You run node scripts/qa.js "Your question here", it will use that question.
// Your argv[0] is node, argv[1] is script/qa.js, argv[2] is the argument.
const question =
	process.argv[2] || "What safety should I take when playing Xbox?";

export const createVectorStore = (documents) => {
	return MemoryVectorStore.fromDocuments(documents, new OpenAIEmbeddings());
};

export const documentsFromYTVideo = async (video) => {
	const loader = YoutubeLoader.createFromUrl(video, {
		language: "en",
		addVideoInfo: true,
	});
	return loader.loadAndSplit(
		new CharacterTextSplitter({
			separator: " ",
			chunkSize: 2500,
			chunkOverlap: 100,
		}),
	);
};

export const documentsFromPDF = () => {
	const loader = new PDFLoader("xbox.pdf");
	return loader.loadAndSplit(
		new CharacterTextSplitter({
			separator: ". ",
			chunkSize: 2500,
			chunkOverlap: 200,
		}),
	);
};

// const videoURL = "https://www.youtube.com/watch?v=Z5b3O1gk6GU";
const loadStore = async () => {
	// const video = await documentsFromYTVideo(videoURL);
	const pdf = await documentsFromPDF();
	return createVectorStore([
		// ...video
		...pdf,
	]);
};

const query = async () => {
	const store = await loadStore();
	const results = await store.similaritySearch(question, 1);

	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo-16k",
		temperature: 0,
		messages: [
			{
				role: "assistant",
				content:
					"You are a helpful AI assistant. Answers questions to your best ability.",
			},
			{
				role: "user",
				content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
        
				Question: ${question}
        Context: ${results.map((r) => r.pageContent).join("\n")}`,
			},
		],
	});
	sysLog(
		"OpenAi",
		`: ${response.choices[0].message.content}\n\nSources: ${results
			.map((r) => r.metadata.source)
			.join(", ")}`,
		"green",
	);
};

query();
