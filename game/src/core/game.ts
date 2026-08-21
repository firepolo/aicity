import renderer from "@/core/renderer"
import { load as loadShaders } from "@/renderer/shader"
import { load as loadTextures } from "@/renderer/texture"

class Game {
	async initialize(): Promise<boolean> {
		try {
			renderer.initialize();
			loadShaders();
			await loadTextures();
			return true;
		}
		catch (ex: unknown) {
			console.error(ex);
		}
		return false;
	}

	start(): void {
		requestAnimationFrame(this.tick);
	}

	private tick = (dt: number): void => {
		renderer.render();

		requestAnimationFrame(this.tick);
	}
}

export default new Game();