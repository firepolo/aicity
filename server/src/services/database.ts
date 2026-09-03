import { Client } from "pg";

export const client = new Client({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	ssl: true,
	pipeline: true
});

export default {
	async initialize(): Promise<void> {
		await client.connect();
	},

	async shutdown(): Promise<void> {
		await client.end();
	},
}