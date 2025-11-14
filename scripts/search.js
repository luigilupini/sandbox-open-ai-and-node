/* Introducing text and code embeddings
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	We are introducing embeddings, a new endpoint in the OpenAI API that makes it
	easy to perform natural language and code tasks like semantic search, clustering,
	topic modeling, and classification.
	https://openai.com/index/introducing-text-and-code-embeddings/
*/

import "dotenv/config";

// Imports the Document class to create documents from text data for vector indexing.
import { Document } from "langchain/document";
// Embeddings endpoint we send data to OpenAI and it returns the (embeddings data).
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// Database to store vectors in memory, the semantic representation of the documents.
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// Sample data we will be indexing and searching against.
const movieHistory = [
	{
		id: 1,
		title: "Step brothers",
		description: "Comedic journey full of adult humor and awkwardness.",
	},
	{
		id: 2,
		title: "The Matrix",
		description: "Deals with alternate realities and questioning what's real.",
	},
	{
		id: 3,
		title: "Shutter Island",
		description: "A mind-bending plot with twists and turns.",
	},
	{
		id: 4,
		title: "Memento",
		description:
			"A non-linear narrative that challenges the viewer's perception.",
	},
	{
		id: 5,
		title: "Doctor Strange",
		description: "Features alternate dimensions and reality manipulation.",
	},
	{
		id: 6,
		title: "Paw Patrol",
		description:
			"Children's animated movie where a group of adorable puppies save people.",
	},
	{
		id: 7,
		title: "Interstellar",
		description: "Features futuristic space travel with high stakes",
	},
];

/* Create the vector store instance
	- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	Here we do the math to create embeddings. We use `Document` class from
	LangChain to turn them into embeddings "documents". Which are a list of
	vectors that is an array of numbers representing the text. So when we do
	the search below, the query will also be converted into this list of
	numbers so we can plot against the existing documents in the store.
*/
const createVectorStore = () => {
	return MemoryVectorStore.fromDocuments(
		movieHistory.map(
			(movie) =>
				// All these documents will be converted into vectors "embeddings":
				new Document({
					pageContent: `Title: ${movie.title}\n${movie.description}`,
					metadata: { source: movie.id, title: movie.title },
				}),
		),
		// We then use this function to convert them into embeddings. Remember that
		// embeddings are just a list of vectors (arrays of numbers).
		new OpenAIEmbeddings(),
	);
};

// The query also gets converted into an embedding vector to compare/plot
// against the existing documents in the vector store.
export const search = async (query, count = 1) => {
	// Create the store that indexes the document embeddings "movies" above.
	const store = await createVectorStore();
	// We compare the query embedding against all the stored documents' embedding
	// vectors to find the most similar ones based on similarity. Using a Cosine
	// similarity measures the similarity between two vectors of an inner product
	// space. It is measured by the cosine of the angle between two vectors and
	// determines whether two vectors are pointing in roughly the same direction.
	// https://en.wikipedia.org/wiki/Cosine_similarity
	return store.similaritySearch(query, count);
	// return store.similaritySearchWithScore(query, count);
};

console.log(await search("An adult comedy", 3));
