import { ProgressCallback } from "@/core/loader";
import network from "./network";
import { MessageType } from "@game/shared/network";
import { colors } from "@game/shared/colors";
import { Npc } from "@/entities/npc";
import { Mat4 } from "@/math/mat4";
import { gl } from "./renderer";
import { Model, models } from "@/renderer/model";
import { shaders } from "@/renderer/shader";
import { textures } from "@/renderer/texture";

type CellModel = {
	index: number,
	transform: number,
	texture: number
};

type Cell = {
	street: CellModel,
	north: CellModel,
	west: CellModel,
	east: CellModel,
	south: CellModel
};

const width = 8;
const bound = width - 1;
const grid: Cell[] = new Array<Cell>(width * width);
const npc: Npc[] = [];

const index2Transform = [
	Mat4.identity(),
	Mat4.rotateY(Math.PI * 0.5),
	Mat4.rotateY(Math.PI),
	Mat4.rotateY(Math.PI * 1.5)
];

const index2Model: Array<Model> = [];

const index2Cardinal: { key: keyof Cell, transform: number }[] = [
	{ key: "north", transform: 1 },
	{ key: "west", transform: 2 },
	{ key: "east", transform: 0 },
	{ key: "south", transform: 3 }
];

export default {
	load: async (callback: ProgressCallback): Promise<void> => new Promise((res) => {
		network.once(MessageType.NpcGenerated, (data?: DataView) => {
			const view = data!;
			const count = view.getInt16(1);
			for (let i = 0; i < count; ++i) {
				const j = 3 + i * 6;
				npc.push(new Npc(view.getUint32(j), Object.values(colors.hair)[view.getUint8(j + 4)], Object.values(colors.eye)[view.getUint8(j + 5)]));
			}

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

			for (let y = 0; y < width; ++y) {
				for (let x = 0; x < width; ++x) {
					const i = y * width + x;
					grid[i] = {
						street: { index: map[i] == 0 ? -1 : 0, transform: -1, texture: 0 },
						north: { index: -1, transform: -1, texture: 0 },
						west: { index: -1, transform: -1, texture: 0 },
						east: { index: -1, transform: -1, texture: 0 },
						south: { index: -1, transform: -1, texture: 0 }
					};
				}
			}

			for (let y = 1; y < bound; ++y) {
				for (let x = 1; x < bound; ++x) {
					const i = y * width + x;
					const cell = grid[i];
					if (cell.street.index < 0) continue;

					const n = grid[i - width];
					const w = grid[i - 1];
					const e = grid[i + 1];
					const s = grid[i + width];
					const c = ((n.street.index >= 0 ? 1 : 0) << 3) | ((w.street.index >= 0 ? 1 : 0) << 2) | ((e.street.index >= 0 ? 1 : 0) << 1) | (s.street.index >= 0 ? 1 : 0);
					if (c == 0b0000) {
						cell.street.index = -1;
						continue;
					}

					if (c == 0b0001) {
						cell.street.index = 5;
						cell.street.transform = 2;
					}
					else if (c == 0b0010) {
						cell.street.index = 5;
						cell.street.transform = 0;
					}
					else if (c == 0b0011) {
						cell.street.index = 7;
						cell.street.transform = 3;
					}
					else if (c == 0b0100) {
						cell.street.index = 5;
						cell.street.transform = 1;
					}
					else if (c == 0b0101) {
						cell.street.index = 7;
						cell.street.transform = 2;
					}
					else if (c == 0b0110) {
						cell.street.index = 6;
						cell.street.transform = 1;
					}
					else if (c == 0b0111) {
						cell.street.index = 8;
						cell.street.transform = 3;
					}
					else if (c == 0b1000) {
						cell.street.index = 5;
						cell.street.transform = 0;
					}
					else if (c == 0b1001) {
						cell.street.index = 6;
						cell.street.transform = 0;
					}
					else if (c == 0b1010) {
						cell.street.index = 7;
						cell.street.transform = 0;
					}
					else if (c == 0b1011) {
						cell.street.index = 8;
						cell.street.transform = 0;
					}
					else if (c == 0b1100) {
						cell.street.index = 7;
						cell.street.transform = 1;
					}
					else if (c == 0b1101) {
						cell.street.index = 8;
						cell.street.transform = 2;
					}
					else if (c == 0b1110) {
						cell.street.index = 8;
						cell.street.transform = 1;
					}
					else if (c == 0b1111) {
						cell.street.index = 9;
						cell.street.transform = 0;
					}

					for (let i = 0; i < 4; ++i) {
						if (c & (1 << i)) continue;
		
						const cardinal = index2Cardinal[i];
						const model = cell[cardinal.key];
						//model.index = Math.floor(Math.random() * index2Building.length);
						model.index = 0;
						model.transform = cardinal.transform;
					}
				}
			}

			res();
		});

		for (const key of [
			"building001",
			"building002",
			"building003",
			"building004",
			"building005",
			"streetc",
			"streeti",
			"streetl",
			"streett",
			"streetx"
		]) index2Model.push(models[key]);

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
				if (cell.street.index < 0) continue;

				gl.bindTexture(gl.TEXTURE_2D, textures["streeti"]);
				gl.uniformMatrix4fv(shaders["basic"].uniforms["uModel"], false, Mat4.mul(index2Transform[cell.street.transform], Mat4.translate(x * 32, 0, y * 32)));
				index2Model[cell.street.index].render()

				for (const cardinal of index2Cardinal) {
					const model = cell[cardinal.key]
					if (model.index < 0) continue;
					gl.bindTexture(gl.TEXTURE_2D, textures["building001"]);
					gl.uniformMatrix4fv(shaders["basic"].uniforms["uModel"], false, Mat4.mul(index2Transform[model.transform], Mat4.translate(x * 32, 0, y * 32)));
					index2Model[model.index].render()
				}
			}
		}
	}
}