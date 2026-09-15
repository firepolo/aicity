import "dotenv/config";
import { RecursiveChunker } from "@chonkiejs/core";
import { faker } from "@faker-js/faker";
import OpenAI from "openai";
import { Pool } from "pg";

const Conversations = [
	"Question: Quelle est la capitale de la France ?\nRéponse: La capitale de la France est Paris.",
	"Question: Pourquoi le ciel est-il bleu ?\nRéponse: Le ciel paraît bleu car l'atmosphère diffuse davantage les courtes longueurs d'onde de la lumière, notamment le bleu, que les longues longueurs d'onde.",
	"Question: Combien font 15 x 8 ?\nRéponse: 15 x 8 = 120.",
	"Question: Qu'est-ce qu'un algorithme ?\nRéponse: Un algorithme est une suite d'instructions précises permettant de résoudre un problème ou d'effectuer une tâche.",
	"Question: Quels sont les avantages de faire du sport ?\nRéponse: Le sport peut améliorer la condition physique, renforcer les muscles, réduire le stress et favoriser un meilleur sommeil.",
	"Question: Comment fonctionne une batterie ?\nRéponse: Une batterie transforme l'énergie chimique en énergie électrique grâce à des réactions électrochimiques entre ses différents composants.",
	"Question: Quelle est la différence entre RAM et stockage ?\nRéponse: La RAM sert à stocker temporairement les données utilisées par les programmes. Le stockage conserve les fichiers et applications même lorsque l'appareil est éteint.",
	"Question: Pourquoi faut-il boire de l'eau ?\nRéponse: L'eau est essentielle au fonctionnement du corps. Elle participe notamment à la régulation de la température, au transport des nutriments et à l'élimination des déchets.",
	"Question: Qu'est-ce que l'intelligence artificielle ?\nRéponse: L'intelligence artificielle désigne des systèmes capables d'effectuer des tâches nécessitant habituellement certaines capacités humaines, comme comprendre du texte, reconnaître des images ou apprendre.",
	"Question: Comment améliorer sa productivité au quotidien ?\nRéponse: Fixez quelques priorités, découpez les tâches complexes en étapes, limitez les distractions et prévoyez des pauses régulières pour maintenir votre concentration."
];

const CityDescription = `Valdérane est une grande ville fictive située sur la côte méditerranéenne, dans le sud de l'Europe. En 2026, elle compte environ 1,4 million d'habitants dans son agglomération. Elle n'apparaît sur aucune carte réelle : c'est une ville inventée, mais son histoire, son urbanisme et son fonctionnement sont entièrement plausibles.
La ville s'est développée autour d'une large baie naturelle. Au nord, des collines couvertes de pins dominent les quartiers résidentiels. Au sud, le port industriel s'étend sur plusieurs kilomètres avant de laisser place à des plages et à des zones touristiques. Entre les deux se trouve un centre urbain dense, traversé par des lignes de tramway, des avenues anciennes et plusieurs cours d'eau canalisés.
Valdérane est surtout connue pour ses quartiers très différents les uns des autres.
Le Vieux-Valdérane constitue le cœur historique. Ses rues sont étroites, ses immeubles datent pour certains du XVIIIe ou du XIXe siècle et les façades ont été plusieurs fois restaurées. C'est un quartier très vivant, rempli de petits commerces, de cafés, de restaurants et de logements parfois minuscules. Les touristes y sont nombreux en été, mais les habitants continuent d'y vivre.
À quelques kilomètres se trouve Montfaucon, un quartier construit sur les premières collines. Les maisons y sont plus grandes, les rues plus calmes et les jardins nombreux. Certaines villas appartiennent à des familles installées à Valdérane depuis plusieurs générations. D'autres sont devenues des résidences très recherchées par les personnes aisées.
À l'opposé, les Docks sont le quartier industriel. On y trouve des entrepôts, des ateliers mécaniques, des entreprises de transport, des grues portuaires et des immeubles de bureaux construits plus récemment. Une partie du secteur est en pleine transformation : d'anciens bâtiments industriels sont progressivement convertis en logements, studios d'artistes et espaces commerciaux.
Le quartier de Saint-Roch est beaucoup plus populaire. De grands immeubles construits entre les années 1960 et 1980 entourent des écoles, des terrains de sport et de petites places. La population y est particulièrement diverse, avec des habitants originaires de nombreuses régions du pays et de l'étranger. Saint-Roch a parfois mauvaise réputation, mais la majorité du quartier est parfaitement ordinaire : des familles, des étudiants, des retraités et des travailleurs qui se croisent quotidiennement.
Plus à l'est se trouve Les Arcades, un immense secteur commercial. Centres commerciaux, magasins indépendants, bureaux, hôtels et restaurants y sont concentrés. C'est aussi l'un des quartiers les plus fréquentés le week-end.
Au bord de la mer se trouve Belmare, le quartier touristique. Les immeubles y sont plus modernes, les appartements souvent destinés à la location saisonnière et les rues beaucoup plus animées pendant les vacances. Hors saison, certains secteurs deviennent étonnamment silencieux.
Entre Belmare et les Docks se trouve le quartier universitaire. Il rassemble une grande université publique, plusieurs écoles privées, des résidences étudiantes, des bibliothèques, des bars et des logements bon marché. C'est le quartier où la population est la plus jeune.
Enfin, il existe Valdérane-Nord, une vaste zone de logements construite rapidement après les années 1990\. Elle possède de larges avenues, des immeubles modernes, des parkings, des supermarchés et de nombreux espaces verts. C'est un quartier très pratique mais considéré comme peu intéressant par les habitants du centre.
La ville possède également des zones moins connues : un ancien quartier ferroviaire presque entièrement abandonné, des villages absorbés par l'expansion urbaine, des lotissements construits sur les collines et plusieurs petites communautés installées près des anciennes carrières.
En 2026, Valdérane fonctionne comme une ville européenne normale. Elle possède des hôpitaux, des écoles publiques, des universités, une police municipale, des tribunaux, des entreprises privées, des associations, des clubs sportifs et une administration municipale parfois critiquée pour sa lenteur. Les habitants utilisent des smartphones, Internet, les réseaux sociaux et les transports modernes, mais il n'existe aucune intelligence artificielle consciente ou mystérieuse. Les ordinateurs et logiciels de la ville restent des outils ordinaires conçus et contrôlés par des humains.
La ville a cependant un secret.
Sous Valdérane existe un ancien réseau de tunnels beaucoup plus vaste que ce que connaissent officiellement les autorités.
Une partie de ces tunnels correspond à d'anciennes galeries d'exploitation, à des conduites d'eau et à des passages construits pendant les périodes de guerre. Mais une section entière n'apparaît sur aucun plan municipal.
Quelques habitants connaissent son existence.
Ils racontent qu'une porte métallique, enterrée sous un ancien bâtiment administratif des Docks, donne accès à plusieurs kilomètres de galeries. À l'intérieur se trouvent des pièces murées, des inscriptions datant de plusieurs décennies et surtout une ancienne salle remplie de dossiers papier.
Personne ne sait exactement pourquoi ces documents ont été cachés.
La municipalité affirme que ces histoires sont des légendes urbaines.
Pourtant, certains plans anciens de Valdérane montrent une rue qui n'existe officiellement pas.
Et cette rue correspond exactement à l'emplacement d'une galerie souterraine.
Le plus étrange est que les documents retrouvés dans cette galerie semblent raconter l'histoire de Valdérane d'une manière légèrement différente de celle enseignée dans les écoles.
Personne ne sait encore laquelle des deux versions est la vraie.
Et, en 2026, quelques habitants continuent discrètement de chercher la réponse.
`;

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	pipeline: true,
	ssl: !!process.env.DB_SSL
});

const pql = await pool.connect();

const oai = new OpenAI({
	baseURL: process.env.OPENAI_HOST,
	apiKey: process.env.OPENAI_API_KEY
});

if ((await pql.query("SELECT npc_id FROM informations WHERE npc_id IS NULL")).rowCount == 0) {
	const chunks = await (await RecursiveChunker.create({
		minCharactersPerChunk: 64,
		chunkSize: 512
	})).chunk(CityDescription);

	try {
		await pql.query("BEGIN");

		for (const chunk of chunks) {
			const embedding = await oai.embeddings.create({
				model: process.env.OPENAI_MODEL_EMBEDDING!,
				input: chunk.text,
				encoding_format: "float"
			});
			await pql.query("INSERT INTO informations(npc_id, text, embedding) VALUES(NULL, $1, $2)", [
				chunk, JSON.stringify(embedding.data[0].embedding)
			]);
		}

		await pql.query("COMMIT");
	}
	catch (e) {
		pql.query("ROLLBACK");
		console.error(e);
	}
}

if ((await pql.query("SELECT id FROM npcs LIMIT 1")).rowCount == 0) {
	try {
		await pql.query("INSERT INTO npcs(client_id, attributes) VALUES($1, $2)", [
			crypto.randomUUID(),
			JSON.stringify({
				firstname: faker.person.firstName(),
				lastname: faker.person.lastName(),
				sex: faker.person.sex(),
				age: faker.number.int({ min: 20, max: 70 }),
				job: faker.person.jobTitle(),
				zodiac: faker.person.zodiacSign(),
				haircolor: faker.color.human(),
				eyecolor: faker.color.human(),
				personality: {
					openness: faker.number.int({ min: 0, max: 100 }),
  					conscientiousness: faker.number.int({ min: 0, max: 100 }),
  					extraversion: faker.number.int({ min: 0, max: 100 }),
  					agreeableness: faker.number.int({ min: 0, max: 100 }),
  					neuroticism: faker.number.int({ min: 0, max: 100 }),
  					honesty: faker.number.int({ min: 0, max: 100 }),
  					empathy: faker.number.int({ min: 0, max: 100 }),
  					impulsivity: faker.number.int({ min: 0, max: 100 })
				}
			})
		]);
	}
	catch (e) {
		console.error(e);
	}
}

const npc = (await pql.query("SELECT * FROM npcs ORDER BY id DESC LIMIT 1")).rows[0];

try {
	await pql.query("BEGIN");

	for (const questionAnswer of Conversations) {
		const embedding = await oai.embeddings.create({
			model: process.env.OPENAI_MODEL_EMBEDDING!,
			input: questionAnswer,
			encoding_format: "float"
		});
		await pql.query("INSERT INTO informations(npc_id, text, embedding) VALUES($1, $2, $3)", [
			npc.id, questionAnswer, JSON.stringify(embedding.data[0].embedding)
		]);
	}

	await pql.query("COMMIT");
}
catch (e) {
	pql.query("ROLLBACK");
	console.error(e);
}

const userPrompt = process.argv[2]?.trim();
if (!userPrompt) process.exit(0);

const userEmbedding = (await oai.embeddings.create({
	model: process.env.OPENAI_MODEL_EMBEDDING!,
	input: userPrompt,
	encoding_format: "float"
})).data[0].embedding;

const context = (await pql.query("SELECT text FROM informations WHERE npc_id = $1 OR npc_id IS NULL ORDER BY embedding <=> $2 LIMIT 3", [
	npc.id,
	JSON.stringify(userEmbedding)
])).rows;

const response = await oai.responses.create({
	model: process.env.OPENAI_MODEL_CHAT!,
	instructions: process.env.OPENAI_SYSTEM_PROMPT,
	input: "Here the user's question:\n" + userPrompt + "\nHere the information on you in JSON format:\n" + JSON.stringify(npc.attributes) + "\nHere the retrieved context:\n" + context.map(c => c.text).join("\n")
});

await pql.release()

console.log(response.output_text);
