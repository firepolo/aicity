import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
	baseURL: process.env.OPENAI_HOST,
	apiKey: process.env.OPENAI_API_KEY
});

const embedding = await client.embeddings.create({
	model: process.env.OPENAI_MODEL_EMBEDDING!,
	input: "Bonjour moi c'est Michel !",
	encoding_format: "float"
});

console.log(embedding.data[0].embedding);