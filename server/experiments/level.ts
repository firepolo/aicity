type Cell = { road: boolean, north: number, west: number, east: number, south: number };

const width = 32;
const bound = width - 1;
const grid = Array.from({ length: width * width }).map<Cell>(_ => ({ road: false, north: 0, west: 0, east: 0, south: 0 }));
const dirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
const queue = Array<{ x: number, y: number }>();

queue.push({ x: Math.floor(Math.random() * width) - 2 + 1, y: Math.floor(Math.random() * width) - 2 + 1 });

while (queue.length > 0) {
	const p = queue.pop()!;

	const i = p.y * width + p.x;
	if (grid[i].road) continue;
	
	grid[i].road = true;

	tryloop:
		for (let j = 0; j < 4; ++j) {
			const dir = dirs[Math.floor(Math.random() * 4)];
			for (let t = 1; t <= 2; ++t) {
				const nx = p.x + dir.x * t;
				const ny = p.y + dir.y * t;
				const ni = ny * width + nx;
				if (nx < 1 || nx >= bound || ny < 1 || ny >= bound || grid[ni].road) continue tryloop;
			}

			grid[(p.y + dir.y) * width + p.x + dir.x].road = true;
			queue.push({ x: p.x + dir.x * 2, y: p.y + dir.y * 2 });
		}
}

for (let y = 0; y < width; ++y) {
	let line = "";
	for (let x = 0; x < width; ++x) {
		line += grid[y * width + x].road ? " " : "#";
	}
	console.log(line);
}