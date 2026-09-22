import renderer from "@/core/renderer";
import input from "@/core/input";
import network from "@/core/network";
import shader from "@/renderer/shader";
import texture from "@/renderer/texture";
import model from "@/renderer/model";
import level from "./level";
import overlay from "../ui/overlay";
import chatbox from "@/ui/chatbox";

export default {
	async boot(): Promise<void> {
		chatbox.hide();

		try {
			overlay.setTitle("Initializing...");
			renderer.initialize();
			input.initialize();
			await network.initialize();

			overlay.setTitle("Loading...");
			await shader.load();
			await texture.load();
			await model.load();
			await level.load();

			renderer.postInitialize();
		}
		catch (ex: unknown) {
			console.error(ex);
		}

		overlay.hide();
	}
}