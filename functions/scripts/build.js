import fs from "node:fs";
import path from "node:path";

const inputdir = path.resolve(process.argv[2]);
const outputdir = path.resolve(process.argv[3]);
if (!inputdir || !outputdir) {
    console.error("Usage : node bundle.js <input.js> <output.js>");
    process.exit(1);
}

fs.mkdirSync(outputdir, {
	recursive: true
});

for (const input of fs.readdirSync(inputdir, { recursive: true })) {
	const inputpath = path.join(inputdir, input);
	const source = fs.readFileSync(inputpath, "utf8");
	if (source.indexOf("@game/shared") < 0) continue;

	fs.writeFileSync(path.join(outputdir, input), source.replace(/import\s+{([^}]*)}\s+from\s+["']@game\/shared\/([^"']+)["'];/g, (_, imports, file) => {
		const exports = imports.trim().split(', ');
		const source = fs.readFileSync(path.resolve(`../shared/src/${file}.ts`));
    	return exports.map(exp => new RegExp(`export (const [^${exp[0]}]*${exp}[^;]*;)`, "g").exec(source)[1]).join("\r\n");
	}), "utf8");
}
