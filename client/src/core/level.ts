import { ProgressCallback } from "@/core/loader";
import network from "./network";
import { MessageType } from "@game/shared/network";
import { colors } from "@game/shared/colors";
import { Npc } from "@/entities/npc";
import { Mat4 } from "@/math/mat4";
import { models } from "@/renderer/model";
import { Cell } from "@/core/cell";
import { textures } from "@/renderer/texture";
import { Entity } from "@/entities/entity";
import { LinkedList } from "./linkedlist";
import camera from "./camera";
import { Collidable } from "@/entities/collidable";

const CellWidth = 30;
const HalfCellWidth = CellWidth * 0.5;
const InvCellWidth = 1 / CellWidth;
const Width = 64;
const WidthLimit = Width - 1;
const ShiftWidth = 6;
const StreetWidth = CellWidth * 0.25;
const ChunkSize = 64;

const map: number[] = new Array<number>(Width * Width);
const nexts: number[][] = new Array<number[]>(Width * Width);
const cells: Cell[][] = new Array<Cell[]>(Width * Width);
const npcs: Npc[] = [];
const npcGrid: LinkedList<Npc>[] = Array.from({ length: Width * Width }).map(_ => new LinkedList<Npc>());

const cache = {
	tx: 0,
	ty: 0,
	l: 0,
	r: 0,
	t: 0,
	b: 0,
	chunk: 0,
	chunkstep: 0
};

function generate(): void {
	const dirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
	const queue = Array<{ x: number, y: number }>();

	map.fill(0);
	queue.push({ x: Math.floor(Math.random() * Width) - 2 + 1, y: Math.floor(Math.random() * Width) - 2 + 1 });

	while (queue.length > 0) {
		const p = queue.pop()!;

		for (let j = 0; j < 4; ++j) {
			const dir = dirs[Math.floor(Math.random() * 4)];
			const nx0 = p.x + dir.x;
			const ny0 = p.y + dir.y;
			const ni0 = (ny0 << ShiftWidth) + nx0;
			if (nx0 < 1 || nx0 >= WidthLimit || ny0 < 1 || ny0 >= WidthLimit || map[ni0]) continue;
			const nx1 = p.x + dir.x * 2;
			const ny1 = p.y + dir.y * 2;
			const ni1 = (ny1 << ShiftWidth) + nx1;
			if (nx1 < 1 || nx1 >= WidthLimit || ny1 < 1 || ny1 >= WidthLimit || map[ni1]) continue;

			map[ni0] = 1;
			map[ni1] = 1;
			queue.push({ x: nx1, y: ny1 });
		}
	}
}

function updateNpcList(index: number, elapsedTime: number): void {
	const list = npcGrid[index];
	if (!list) return;

	for (let node = list.begin; node; node = node.next) {
		const npc = node.value;
		if (npc.time >= 0.9999) {
			const nextIndexes = nexts[index];
			const next = nextIndexes.length > 1 || npc.prevIndex < 0 ? nextIndexes.filter(n => n != npc.prevIndex)[Math.floor(Math.random() * (nextIndexes.length - 1))] : npc.prevIndex;
			npc.waypoint.set(npc.waypoint.x + npc.direction.x, npc.waypoint.y + npc.direction.y);
			npc.direction.set(((next & WidthLimit) * CellWidth + (Math.random() - Math.random()) * StreetWidth) - npc.waypoint.x, ((next >> ShiftWidth) * CellWidth + (Math.random() - Math.random()) * StreetWidth) - npc.waypoint.y);
			npc.distance = 1.0 / npc.direction.length();
			npc.look.setNormalize(npc.direction);
			npc.time = 0.0;
			continue;
		}

		npc.time = Math.min(npc.time + npc.speed * elapsedTime * npc.distance, 1.0);
		npc.position.setXYZ(npc.waypoint.x + npc.direction.x * npc.time, 0.0, npc.waypoint.y + npc.direction.y * npc.time);
		const next = (Math.floor((npc.position.z + HalfCellWidth) * InvCellWidth) << ShiftWidth) + Math.floor((npc.position.x + HalfCellWidth) * InvCellWidth);
		if (index != next) {
			npc.prevIndex = index;
			npcGrid[next].push(npc);
			node = list.remove(node);
			if (!node) return;
		}
	}
}

export default {
	load: async (callback: ProgressCallback): Promise<void> => new Promise((res) => {
		network.once(MessageType.NpcGenerated, (data?: DataView) => {
			const view = data!;
			const count = view.getInt16(1);
			for (let i = 0; i < count; ++i) {
				const j = 3 + i * 6;
				npcs.push(new Npc(view.getUint32(j), Object.values(colors.hair)[view.getUint8(j + 4)], Object.values(colors.eye)[view.getUint8(j + 5)], textures.npc));
			}

			const index2Transform = [
				Mat4.identity(),
				Mat4.rotateY(Math.PI * 0.5),
				Mat4.rotateY(Math.PI),
				Mat4.rotateY(Math.PI * 1.5)
			];

			const cardinal2Index = [ 1, 2, 0, 3 ];

			const index2BuildingName = [
				"building001",
				"building002",
				"building003",
				"building005"
			];

			for (let y = 1; y < WidthLimit; ++y) {
				for (let x = 1; x < WidthLimit; ++x) {
					const i = (y << ShiftWidth) + x;
					if (!map[i]) continue;

					const c = (map[i - Width] << 3) | (map[i - 1] << 2) | (map[i + 1] << 1) | map[i + Width];
					if (c == 0b0000) continue;

					const translate = Mat4.translate(x * CellWidth, 0.0, y * CellWidth);

					const cell: Cell[] = [];

					if (c == 0b0001) cell.push(new Cell(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b0010) cell.push(new Cell(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[3], translate)));
					else if (c == 0b0011) cell.push(new Cell(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[3], translate)));
					else if (c == 0b0100) cell.push(new Cell(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b0101) cell.push(new Cell(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b0110) cell.push(new Cell(models["streeti"], textures["streeti"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b0111) cell.push(new Cell(models["streett"], textures["streett"], Mat4.mul(index2Transform[3], translate)));
					else if (c == 0b1000) cell.push(new Cell(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1001) cell.push(new Cell(models["streeti"], textures["streeti"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1010) cell.push(new Cell(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1011) cell.push(new Cell(models["streett"], textures["streett"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1100) cell.push(new Cell(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b1101) cell.push(new Cell(models["streett"], textures["streett"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b1110) cell.push(new Cell(models["streett"], textures["streett"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b1111) cell.push(new Cell(models["streetx"], textures["streetx"], Mat4.mul(index2Transform[0], translate)));

					for (let i = 0; i < 4; ++i) {
						if (c & (1 << i)) continue;
						const name = index2BuildingName[Math.floor(Math.random() * index2BuildingName.length)];
						cell.push(new Cell(models[name], textures[name], Mat4.mul(index2Transform[cardinal2Index[i]], translate)));
					}

					cells[i] = cell;
				}
			}

			res();
		});

		callback("Loading level");

		generate();

		const buffer = new ArrayBuffer(1);
		const view = new DataView(buffer);
		view.setUint8(0, MessageType.GenerateNpc);

		network.send(buffer);
	}),

	initialize(entity: Entity): void {
		const streets = map.reduce((a: number[], m: number, i: number) => m > 0 ? [...a, i] : a, []);

		let index = streets[Math.floor(Math.random() * 0.9999 * streets.length)];
		entity.position.setXYZ((index & WidthLimit) * CellWidth, 0.0, (index >> ShiftWidth) * CellWidth);

		for (let i = 0; i < nexts.length; ++i) nexts[i] = [ i - Width, i - 1, i + 1, i + Width ].filter(n => map[n] > 0);

		for (const npc of npcs) {
			index = streets[Math.floor(Math.random() * (streets.length - 1))];
			npc.waypoint.set((index & WidthLimit) * CellWidth + (Math.random() - Math.random()) * StreetWidth, (index >> ShiftWidth) * CellWidth + (Math.random() - Math.random()) * StreetWidth);
			npc.time = 1.0;
			npcGrid[index].push(npc);
		}

		for (let i = 0; i < npcGrid.length; ++i) updateNpcList(i, 0);

		cache.chunkstep = npcs.length / ChunkSize;
	},

	update(elapsedTime: number): void {
		cache.tx = Math.floor(camera.position.x * InvCellWidth + 0.5);
		cache.ty = Math.floor(camera.position.z * InvCellWidth + 0.5);
		cache.l = Math.max(1, cache.tx - 4);
		cache.r = Math.min(WidthLimit, cache.tx + 4);
		cache.t = Math.max(1, cache.ty - 4);
		cache.b = Math.min(WidthLimit, cache.ty + 4);

		for (let index = cache.chunk, e = index + ChunkSize; index < e; ++index) {
			const x = index & WidthLimit, y = index >> ShiftWidth;
			if (y >= cache.t && y <= cache.b && x >= cache.l && x <= cache.r) continue;
			updateNpcList(index, elapsedTime * cache.chunkstep);
		}
		cache.chunk = (cache.chunk + ChunkSize) % npcs.length;

		for (let y = cache.t; y <= cache.b; ++y)
			for (let x = cache.l; x <= cache.r; ++x) updateNpcList((y << ShiftWidth) + x, elapsedTime);
	},

	collision(collidable: Collidable): void {
		if (collidable.velocity.zero()) return;
		
		const nx = collidable.position.x + collidable.velocity.x + HalfCellWidth,
			ny = collidable.position.z + collidable.velocity.z + HalfCellWidth,
			l = nx - collidable.hitbox,
			r = nx + collidable.hitbox,
			t = ny - collidable.hitbox,
			b = ny + collidable.hitbox,
			tx = Math.floor(nx * InvCellWidth),
			ty = Math.floor(ny * InvCellWidth),
			tl = Math.floor(l * InvCellWidth),
			tr = Math.floor(r * InvCellWidth),
			tt = Math.floor(t * InvCellWidth),
			tb = Math.floor(b * InvCellWidth),
			tyw = ty << ShiftWidth,
			tbw = tb << ShiftWidth,
			ttw = tt << ShiftWidth;

    	let edge = false;
    	if (!map[tyw + tl]) {
			collidable.velocity.x += tx * CellWidth - l;
			edge = true;
		}
    	if (!map[tyw + tr]) {
			collidable.velocity.x -= r - tr * CellWidth;
			edge = true;
		}
    	if (!map[ttw + tx]) {
			collidable.velocity.z += ty * CellWidth - t;
			edge = true;
		}
    	if (!map[tbw + tx]) {
			collidable.velocity.z -= b - tb * CellWidth;
			edge = true;
		}
		if (edge) return;

    	if (!map[tbw + tl]) {
			const dx = tx * CellWidth - l, dy = b - tb * CellWidth;
        	if (Math.abs(collidable.velocity.x / dx) > Math.abs(collidable.velocity.z / dy)) collidable.velocity.x += dx;
        	else collidable.velocity.z -= dy;
			return;
    	}
    	if (!map[tbw + tr]) {
			const dx = r - tr * CellWidth, dy = b - tb * CellWidth;
        	if (Math.abs(collidable.velocity.x / dx) > Math.abs(collidable.velocity.z / dy)) collidable.velocity.x -= dx;
        	else collidable.velocity.z -= dy;
			return;
    	}
    	if (!map[ttw + tl]) {
			const dx = tx * CellWidth - l, dy = ty * CellWidth - t;
        	if (Math.abs(collidable.velocity.x / dx) > Math.abs(collidable.velocity.z / dy)) collidable.velocity.x += dx;
        	else collidable.velocity.z += dy;
			return;
    	}
    	if (!map[ttw + tr]) {
			const dx = r - tr * CellWidth, dy = ty * CellWidth - t;
        	if (Math.abs(collidable.velocity.x / dx) > Math.abs(collidable.velocity.z / dy)) collidable.velocity.x -= dx;
        	else collidable.velocity.z += dy;
			return;
    	}
	},

	renderCells() {
		for (let y = cache.t; y <= cache.b; ++y) {
			for (let x = cache.l; x <= cache.r; ++x) {
				const cell = cells[(y << ShiftWidth) + x];
				if (!cell) continue;
				for (const instance of cell) instance.render();
			}
		}
	},

	renderNpc() {
		models.npc.bind()

		for (let y = cache.t; y <= cache.b; ++y) {
			for (let x = cache.l; x <= cache.r; ++x) {
				const list = npcGrid[(y << ShiftWidth) + x];
				if (!list) continue;

				for (let node = list.begin; node; node = node.next) {
					node.value.render();
					models.npc.draw();
				}
			}
		}
	}
}