import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
    console.error("Usage : node bundle.js <input.js> <output.js>");
    process.exit(1);
}

const source = fs.readFileSync(input, "utf8");
if (source.indexOf("@game/shared") < 0) process.exit(0);

const outputPath = path.resolve(output);

fs.mkdirSync(path.dirname(outputPath), {
	recursive: true
});
fs.writeFileSync(path.resolve(output), source.replace(/import\s+{([^}]*)}\s+from\s+["']@game\/shared\/([^"']+)["'];/g, (_, imports, file) => {
	const exports = imports.trim().split(', ');
	const source = fs.readFileSync(path.resolve(`../shared/src/${file}.ts`));
    return exports.map(exp => new RegExp(`export (const [^${exp[0]}]*${exp}[^;]*;)`, "g").exec(source)[1]).join("\r\n");
}), "utf8");