import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
	baseURL: process.env.OPENAI_HOST,
	apiKey: process.env.OPENAI_API_KEY
});

const response = await client.responses.create({
	model: process.env.OPENAI_MODEL_CHAT!,
	instructions: process.env.OPENAI_SYSTEM_PROMPT,
	input: "Hello !"
});

console.log(response.output_text);