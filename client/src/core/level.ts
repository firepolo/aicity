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

const CellWidth = 30;
const HalfCellWidth = CellWidth * 0.5;
const InvCellWidth = 1 / CellWidth;
const Width = 64;
const Bound = Width - 1;
const BitWidth = 6;

const StreetWidth = CellWidth * 0.25;
const NpcMoveSpeed = 10.0;
const NpcDecisionTime = CellWidth / NpcMoveSpeed;
const NpcUpdateTicks = NpcDecisionTime * 30;
const NpcUpdatePerTick = Math.floor((Width * Width) / NpcUpdateTicks);

const map: number[] = new Array<number>(Width * Width);
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
	update: 0
};
let camera: Entity;
let npcUpdateIndex: number;

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
			const ni0 = (ny0 << BitWidth) + nx0;
			if (nx0 < 1 || nx0 >= Bound || ny0 < 1 || ny0 >= Bound || map[ni0]) continue;
			const nx1 = p.x + dir.x * 2;
			const ny1 = p.y + dir.y * 2;
			const ni1 = (ny1 << BitWidth) + nx1;
			if (nx1 < 1 || nx1 >= Bound || ny1 < 1 || ny1 >= Bound || map[ni1]) continue;

			map[ni0] = 1;
			map[ni1] = 1;
			queue.push({ x: nx1, y: ny1 });
		}
	}
}

function moveNext(): void {
	const nexts = [ npcUpdateIndex - Width, npcUpdateIndex - 1, npcUpdateIndex + 1, npcUpdateIndex + Width ].filter(next => map[next]);

	const list = npcGrid[npcUpdateIndex];
	for (let node = list.begin; node; node = node.next) {
		const next = nexts[Math.floor(Math.random() * nexts.length)];
		npcGrid[next].push(node.value);
		list.remove(node);
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

			for (let y = 1; y < Bound; ++y) {
				for (let x = 1; x < Bound; ++x) {
					const i = (y << BitWidth) + x;
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
		const streets = map.reduce((a: number[], b: number, i: number) => b > 0 ? [...a, i] : a, []);

		let i = streets[Math.floor(Math.random() * streets.length)];
		entity.position.setXYZ((i & Bound) * CellWidth, 0.0, (i >> BitWidth) * CellWidth);

		for (const npc of npcs) {
			i = streets[Math.floor(Math.random() * streets.length)];
			npc.position.setXYZ((i & Bound) * CellWidth + (Math.random() - Math.random()) * StreetWidth, 0.0, (i >> BitWidth) * CellWidth + (Math.random() - Math.random()) * StreetWidth);
			npcGrid[i].push(npc);
		}

		camera = entity;

		//for (npcUpdateIndex = 0; npcUpdateIndex < map.length; ++npcUpdateIndex) moveNext();
		npcUpdateIndex = 0;
	},

	update(elapsedTime: number): void {
		cache.tx = Math.floor(camera.position.x * InvCellWidth + 0.5);
		cache.ty = Math.floor(camera.position.z * InvCellWidth + 0.5);
		cache.l = Math.max(1, cache.tx - 4);
		cache.r = Math.min(Bound, cache.tx + 4);
		cache.t = Math.max(1, cache.ty - 4);
		cache.b = Math.min(Bound, cache.ty + 4);

		/*for (const end = npcUpdateIndex + NpcUpdatePerTick; npcUpdateIndex < map.length || npcUpdateIndex < end; ++npcUpdateIndex) {
			if (!map[npcUpdateIndex]) continue;

			const tx = npcUpdateIndex & Bound, ty = npcUpdateIndex >> BitWidth;
			if (ty < cache.t || ty > cache.b || tx < cache.l || tx > cache.r) moveNext();
		}
		if (npcUpdateIndex >= map.length) npcUpdateIndex = 0;

		for (let y = cache.t; y <= cache.b; ++y) {
			for (let x = cache.l; x <= cache.r; ++x) {
				const list = npcGrid[(y << BitWidth) + x];
				if (!list) continue;

				for (let node = list.begin; node; node = node.next) {
					node.value.position
				}
			}
		}*/
	},

	collision(entity: Entity): void {
		if (entity.velocity.zero()) return;
		
		const nx = entity.position.x + entity.velocity.x + HalfCellWidth,
			ny = entity.position.z + entity.velocity.z + HalfCellWidth,
			l = nx - entity.hitbox,
			r = nx + entity.hitbox,
			t = ny - entity.hitbox,
			b = ny + entity.hitbox,
			tx = Math.floor(nx * InvCellWidth),
			ty = Math.floor(ny * InvCellWidth),
			tl = Math.floor(l * InvCellWidth),
			tr = Math.floor(r * InvCellWidth),
			tt = Math.floor(t * InvCellWidth),
			tb = Math.floor(b * InvCellWidth),
			tyw = ty << BitWidth,
			tbw = tb << BitWidth,
			ttw = tt << BitWidth;

    	let edge = false;
    	if (!map[tyw + tl]) {
			entity.velocity.x += tx * CellWidth - l;
			edge = true;
		}
    	if (!map[tyw + tr]) {
			entity.velocity.x -= r - tr * CellWidth;
			edge = true;
		}
    	if (!map[ttw + tx]) {
			entity.velocity.z += ty * CellWidth - t;
			edge = true;
		}
    	if (!map[tbw + tx]) {
			entity.velocity.z -= b - tb * CellWidth;
			edge = true;
		}
		if (edge) return;

    	if (!map[tbw + tl]) {
			const dx = tx * CellWidth - l, dy = b - tb * CellWidth;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x += dx;
        	else entity.velocity.z -= dy;
			return;
    	}
    	if (!map[tbw + tr]) {
			const dx = r - tr * CellWidth, dy = b - tb * CellWidth;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x -= dx;
        	else entity.velocity.z -= dy;
			return;
    	}
    	if (!map[ttw + tl]) {
			const dx = tx * CellWidth - l, dy = ty * CellWidth - t;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x += dx;
        	else entity.velocity.z += dy;
			return;
    	}
    	if (!map[ttw + tr]) {
			const dx = r - tr * CellWidth, dy = ty * CellWidth - t;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x -= dx;
        	else entity.velocity.z += dy;
			return;
    	}
	},

	renderCells() {
		for (let y = cache.t; y <= cache.b; ++y) {
			for (let x = cache.l; x <= cache.r; ++x) {
				const cell = cells[(y << BitWidth) + x];
				if (!cell) continue;
				for (const instance of cell) instance.render();
			}
		}
	},

	renderNpc() {
		models.npc.bind()

		/*for (const npc of npcs) {
			npc.render();
			models.npc.draw();
		}*/

		for (let y = cache.t; y <= cache.b; ++y) {
			for (let x = cache.l; x <= cache.r; ++x) {
				const list = npcGrid[(y << BitWidth) + x];
				if (!list) continue;

				for (let node = list.begin; node; node = node.next) {
					node.value.render();
					models.npc.draw();
				}
			}
		}
	}
}