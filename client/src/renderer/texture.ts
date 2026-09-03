import { gl } from "@/core/renderer";
import { ProgressCallback } from "@/core/loader"
import building001 from "@/assets/textures/building.001.png";
import building002 from "@/assets/textures/building.002.png";
import building003 from "@/assets/textures/building.003.png";
import building004 from "@/assets/textures/building.004.png";
import building005 from "@/assets/textures/building.005.png";
import streeti from "@/assets/textures/street.i.png";
import streetl from "@/assets/textures/street.l.png";
import streett from "@/assets/textures/street.t.png";
import streetx from "@/assets/textures/street.x.png";

export const textures: Record<string, WebGLTexture> = {};

export default {
	async load(callback: ProgressCallback): Promise<void> {
		const urls: Record<string, string> = {
			building001,
			building002,
			building003,
			building004,
			building005,
			streeti,
			streetl,
			streett,
			streetx
		};

		for (const name in urls) {
			await new Promise<void>((res) => {
				const image = new Image();
				const url = urls[name];
				callback(url);
				image.onload = () => {
					const texture = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
					textures[name] = texture
					res();
				};
				image.src = url;
			});
		}
	}
}