import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	pipeline: true,
	ssl: true
});

const client = await pool.connect();

try {
	await client.query("BEGIN");

	for (let i = 0; i < 3; ++i) {
		const npc = {
			firstname: ["Pierre", "Paul", "Maurice"][Math.floor(Math.random() * 3)],
			lastname: ["Dupont", "Tombez", "Dubois"][Math.floor(Math.random() * 3)],
			sex: ["Homme", "Femme"][Math.floor(Math.random() * 2)],
			age: 20 + Math.floor(Math.random() * 50),
			job: ["Boulanger", "Menusier", "Charpentier"][Math.floor(Math.random() * 3)],
			zodiac: ["Balance", "Scorpion", "Sagittaire"][Math.floor(Math.random() * 3)],
			haircolor: ["Chatain", "Blond", "Noir"][Math.floor(Math.random() * 3)],
			eyecolor: ["Bleu", "Vert", "Brun"][Math.floor(Math.random() * 3)]
		};
		console.log(crypto.randomUUID())
		await client.query("INSERT INTO npc(uuid, client_id, attributes, description) VALUES($1, $2, $3, $4)", [
			crypto.randomUUID(),
			crypto.randomUUID(),
			JSON.stringify(npc),
			""
		]);
	}

	await client.query("COMMIT");
}
catch (e) {
	client.query("ROLLBACK");
}

console.log((await client.query("SELECT * FROM npc")).rows);

await client.release()