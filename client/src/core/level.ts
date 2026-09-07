import { ProgressCallback } from "@/core/loader";
import network from "./network";
import { MessageType } from "@game/shared/network";
import { colors } from "@game/shared/colors";
import { Npc } from "@/entities/npc";
import { Mat4 } from "@/math/mat4";
import { models } from "@/renderer/model";
import { ModelInstance } from "@/renderer/modelInstance";
import { textures } from "@/renderer/texture";

type Cell = ModelInstance[];

const width = 8;
const bound = width - 1;
const grid: Cell[] = new Array<Cell>(width * width);
const npc: Npc[] = [];

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

			const map: number[] = [
				0,0,0,0,0,0,0,0,
				0,1,1,1,1,1,1,0,
				0,1,0,1,1,1,1,0,
				0,1,1,0,1,1,1,0,
				0,1,0,1,0,1,1,0,
				0,0,1,0,1,0,1,0,
				0,0,1,0,1,1,0,0,
				0,0,0,0,0,0,0,0
			];

			for (let y = 1; y < bound; ++y) {
				for (let x = 1; x < bound; ++x) {
					const i = y * width + x;
					if (!map[i]) continue;

					const c = (map[i - width] << 3) | (map[i - 1] << 2) | (map[i + 1] << 1) | map[i + width];
					if (c == 0b0000) continue;

					const translate = Mat4.translate(x * 30, 0.0, y * 30);

					const cell: ModelInstance[] = [];

					if (c == 0b0001) cell.push(new ModelInstance(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[2], translate)));
					else if (c == 0b0010) cell.push(new ModelInstance(models["streetc"], textures["streetc"], Mat4.mul(index2Transform[0], translate)));
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
						cell.push(new ModelInstance(models[index2BuildingName[Math.floor(Math.random() * index2BuildingName.length)]], textures["building002"], Mat4.mul(index2Transform[cardinal2Index[i]], translate)));
					}

					if (x == 1 && y == 1) console.log(cell);

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

	render() {
		for (let y = 0; y < width; ++y) {
			for (let x = 0; x < width; ++x) {
				const cell = grid[y * width + x];
				if (!cell) continue;
				for (const model of cell) model.render();
			}
		}
	}
}