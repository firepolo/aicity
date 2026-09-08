import { ProgressCallback } from "@/core/loader";
import network from "./network";
import { MessageType } from "@game/shared/network";
import { colors } from "@game/shared/colors";
import { Npc } from "@/entities/npc";
import { Mat4 } from "@/math/mat4";
import { models } from "@/renderer/model";
import { ModelInstance } from "@/renderer/modelInstance";
import { textures } from "@/renderer/texture";
import { Vec3 } from "@/math/vec3";
import { Entity } from "@/entities/entity";

type Cell = ModelInstance[];

const cellWidth = 30;
const halfCellWidth = cellWidth * 0.5;
const invCellWidth = 1 / cellWidth;
const width = 64;
const bound = width - 1;
const bitWidth = 6;

export const grid: Cell[] = new Array<Cell>(width * width);
const npc: Npc[] = [];

function generate(): number[] {
	const dirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
	const map: number[] = new Array<number>().fill(0);
	const queue = Array<{ x: number, y: number }>();

	queue.push({ x: Math.floor(Math.random() * width) - 2 + 1, y: Math.floor(Math.random() * width) - 2 + 1 });

	while (queue.length > 0) {
		const p = queue.pop()!;

		for (let j = 0; j < 4; ++j) {
			const dir = dirs[Math.floor(Math.random() * 4)];
			const nx0 = p.x + dir.x;
			const ny0 = p.y + dir.y;
			const ni0 = ny0 * width + nx0;
			if (nx0 < 1 || nx0 >= bound || ny0 < 1 || ny0 >= bound || map[ni0]) continue;
			const nx1 = p.x + dir.x * 2;
			const ny1 = p.y + dir.y * 2;
			const ni1 = ny1 * width + nx1;
			if (nx1 < 1 || nx1 >= bound || ny1 < 1 || ny1 >= bound || map[ni1]) continue;

			map[ni0] = 1;
			map[ni1] = 1;
			queue.push({ x: nx1, y: ny1 });
		}
	}

	return map;
}

export default {
	load: async (callback: ProgressCallback): Promise<void> => new Promise((res) => {
		network.once(MessageType.NpcGenerated, (data?: DataView) => {
			const view = data!;
			const count = view.getInt16(1);
			for (let i = 0; i < count; ++i) {
				const j = 3 + i * 6;
				npc.push(new Npc(view.getUint32(j), Object.values(colors.hair)[view.getUint8(j + 4)], Object.values(colors.eye)[view.getUint8(j + 5)]));
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

			const map: number[] = generate();

			for (let y = 1; y < bound; ++y) {
				for (let x = 1; x < bound; ++x) {
					const i = y * width + x;
					if (!map[i]) continue;

					const c = (map[i - width] << 3) | (map[i - 1] << 2) | (map[i + 1] << 1) | map[i + width];
					if (c == 0b0000) continue;

					const translate = Mat4.translate(x * cellWidth, 0.0, y * cellWidth);

					const cell: ModelInstance[] = [];

					if (c == 0b0001) cell.push(new ModelInstance(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b0010) cell.push(new ModelInstance(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[3], translate)));
					else if (c == 0b0011) cell.push(new ModelInstance(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[3], translate)));
					else if (c == 0b0100) cell.push(new ModelInstance(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b0101) cell.push(new ModelInstance(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b0110) cell.push(new ModelInstance(models["streeti"], textures["streeti"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b0111) cell.push(new ModelInstance(models["streett"], textures["streett"], Mat4.mul(index2Transform[3], translate)));
					else if (c == 0b1000) cell.push(new ModelInstance(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1001) cell.push(new ModelInstance(models["streeti"], textures["streeti"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1010) cell.push(new ModelInstance(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1011) cell.push(new ModelInstance(models["streett"], textures["streett"], Mat4.mul(index2Transform[0], translate)));
					else if (c == 0b1100) cell.push(new ModelInstance(models["streetl"], textures["streetl"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b1101) cell.push(new ModelInstance(models["streett"], textures["streett"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b1110) cell.push(new ModelInstance(models["streett"], textures["streett"], Mat4.mul(index2Transform[1], translate)));
					else if (c == 0b1111) cell.push(new ModelInstance(models["streetx"], textures["streetx"], Mat4.mul(index2Transform[0], translate)));

					for (let i = 0; i < 4; ++i) {
						if (c & (1 << i)) continue;
						const name = index2BuildingName[Math.floor(Math.random() * index2BuildingName.length)];
						cell.push(new ModelInstance(models[name], textures[name], Mat4.mul(index2Transform[cardinal2Index[i]], translate)));
					}

					grid[i] = cell;
				}
			}

			res();
		});

		const buffer = new ArrayBuffer(1);
		const view = new DataView(buffer);
		view.setUint8(0, MessageType.GenerateNpc);

		callback("Loading level");
		network.send(buffer);
	}),

	spawn(entity: Entity): void {
		const streets = grid.reduce((a: number[], c: Cell, i: number) => c ? [...a, i] : a, []);

		const i = streets[Math.floor(Math.random() * streets.length)];
		entity.position.x = (i & bound) * cellWidth;
		entity.position.z = (i >> bitWidth) * cellWidth;
	},

	collision(entity: Entity): void {
		if (entity.velocity.zero()) return;
		
		const nx = entity.position.x + entity.velocity.x + halfCellWidth;
		const ny = entity.position.z + entity.velocity.z + halfCellWidth;

    	const l = nx - entity.hitbox;
    	const r = nx + entity.hitbox;
    	const t = ny - entity.hitbox;
    	const b = ny + entity.hitbox;

		const tx = Math.floor(nx * invCellWidth);
		const ty = Math.floor(ny * invCellWidth);
    	const tl = Math.floor(l * invCellWidth);
    	const tr = Math.floor(r * invCellWidth);
    	const tt = Math.floor(t * invCellWidth);
    	const tb = Math.floor(b * invCellWidth);

    	let edge = false;
    	if (!grid[ty * width + tl]) {
			entity.velocity.x += tx * cellWidth - l;
			edge = true;
		}
    	if (!grid[ty * width + tr]) {
			entity.velocity.x -= r - tr * cellWidth;
			edge = true;
		}
    	if (!grid[tt * width + tx]) {
			entity.velocity.z += ty * cellWidth - t;
			edge = true;
		}
    	if (!grid[tb * width + tx]) {
			entity.velocity.z -= b - tb * cellWidth;
			edge = true;
		}
		if (edge) return;

    	if (!grid[tb * width + tl]) {
			const dx = tx * cellWidth - l, dy = b - tb * cellWidth;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x += dx;
        	else entity.velocity.z -= dy;
			return;
    	}
    	if (!grid[tb * width + tr]) {
			const dx = r - tr * cellWidth, dy = b - tb * cellWidth;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x -= dx;
        	else entity.velocity.z -= dy;
			return;
    	}
    	if (!grid[tt * width + tl]) {
			const dx = tx * cellWidth - l, dy = ty * cellWidth - t;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x += dx;
        	else entity.velocity.z += dy;
			return;
    	}
    	if (!grid[tt * width + tr]) {
			const dx = r - tr * cellWidth, dy = ty * cellWidth - t;
        	if (Math.abs(entity.velocity.x / dx) > Math.abs(entity.velocity.z / dy)) entity.velocity.x -= dx;
        	else entity.velocity.z += dy;
			return;
    	}
	},

	render(v: Vec3) {
		const px = Math.floor(v.x * invCellWidth);
		const py = Math.floor(v.z * invCellWidth);
		const l = Math.max(1, px - 4);
		const r = Math.min(bound, px + 4);
		const t = Math.max(1, py - 4);
		const b = Math.min(bound, py + 4);
		
		for (let y = t; y <= b; ++y) {
			for (let x = l; x <= r; ++x) {
				const cell = grid[y * width + x];
				if (!cell) continue;
				for (const instance of cell) instance.render();
			}
		}
	}
}