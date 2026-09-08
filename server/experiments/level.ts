type Cell = { road: boolean, north: number, west: number, east: number, south: number };

const width = 32;
const bound = width - 1;
const grid = Array.from({ length: width * width }).map<Cell>(_ => ({ road: false, north: 0, west: 0, east: 0, south: 0 }));
const dirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
const queue = Array<{ x: number, y: number }>();

queue.push({ x: Math.floor(Math.random() * width) - 2 + 1, y: Math.floor(Math.random() * width) - 2 + 1 });

while (queue.length > 0) {
	const p = queue.pop()!;

	for (let j = 0; j < 4; ++j) {
		const dir = dirs[Math.floor(Math.random() * 4)];
		const nx0 = p.x + dir.x;
		const ny0 = p.y + dir.y;
		const ni0 = ny0 * width + nx0;
		if (nx0 < 1 || nx0 >= bound || ny0 < 1 || ny0 >= bound || grid[ni0].road) continue;
		const nx1 = p.x + dir.x * 2;
		const ny1 = p.y + dir.y * 2;
		const ni1 = ny1 * width + nx1;
		if (nx1 < 1 || nx1 >= bound || ny1 < 1 || ny1 >= bound || grid[ni1].road) continue;

		grid[ni0].road = true;
		grid[ni1].road = true;
		queue.push({ x: nx1, y: ny1 });
	}
}

for (let y = 0; y < width; ++y) {
	let line = "";
	for (let x = 0; x < width; ++x) {
		line += grid[y * width + x].road ? " " : "#";
	}
	console.log(line);
}