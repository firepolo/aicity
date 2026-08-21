import { gl } from "@/core/renderer";
import spritesheet from "@/assets/textures/spritesheet.png";

export const textures: Record<string, WebGLTexture> = {};

export async function load(): Promise<void> {
	const infos = {
		spritesheet
	};

	await Promise.all(Object.entries(infos).map(async ([name, src]): Promise<void> => new Promise((res) => {
		const image = new Image();
		image.src = src;
		image.onload = () => {
			const texture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
			textures[name] = texture
			res();
		};
	})));
}