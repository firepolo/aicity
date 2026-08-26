import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	assetsInclude: ["**/*.vs", "**/*.fs", "**/*.obj"],
	build: {
		outDir: path.resolve("../build/client")
	},
	resolve: {
		alias: {
			"@": path.resolve("./src"),
		}
	},
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: "http://localhost:4000",
				changeOrigin: false,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
});