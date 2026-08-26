import renderer from "@/core/renderer";
import input from "@/core/input";
import network from "@/core/network";
import shader from "@/renderer/shader";
import texture from "@/renderer/texture";
import model from "@/renderer/model";
import level from "./level";

export type ProgressCallback = (message: string) => void;

export default {
	async boot(): Promise<void> {
		const output: HTMLHeadingElement = document.createElement("h1");
		output.style.fontFamily = "Helvetia, Arial, sans-serif";
		output.style.color = "#eee";
		output.textContent = "TEST";

		const wrapper: HTMLDivElement = document.createElement("div");
		wrapper.style.display = "flex";
		wrapper.style.flexDirection = "column";
		wrapper.appendChild(output);

		const overlay: HTMLDivElement = document.createElement("div");
		overlay.style.position = "fixed";
		overlay.style.inset = "0";
		overlay.style.zIndex = "777";
		overlay.style.display = "flex";
		overlay.style.justifyContent = "center";
		overlay.style.alignItems = "center";
		overlay.style.backgroundColor = "#111";
		overlay.appendChild(wrapper);

		document.body.appendChild(overlay);

		const onProgress: ProgressCallback = (message: string): void => {
			output.textContent = message;
		};

		try {
			renderer.initialize();
			input.initialize();
			await network.initialize();

			await shader.load(onProgress);
			await texture.load(onProgress);
			await model.load(onProgress);
			await level.load(onProgress);
		}
		catch (ex: unknown) {
			console.error(ex);
		}

		overlay.remove();
	}
}