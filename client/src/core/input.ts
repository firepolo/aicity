import { Vec2 } from "@/math/vec2";
import { gl } from "./renderer";
import overlay from "../ui/overlay";

export let mouseLocked = false;
export const mouse: Vec2 = new Vec2(0, 0);
export const keys: Record<string, boolean> = {};

function onCanvasClick(): void {
	gl.canvas.requestPointerLock({
		unadjustedMovement: true
	});
}

function onPointerLockChange(): void {
	mouseLocked = document.pointerLockElement === gl.canvas;
}

function onMouseEvent(e: MouseEvent): void {
	const x: number = e.movementX;
	const y: number = e.movementY;
	mouse.set(x, y);
}

function onKeyEvent(e: KeyboardEvent): void {
	keys[e.code] = e.type == "keydown";
}

export default {
	initialize(): void {
		overlay.setSubTitle("Input");

		gl.canvas.addEventListener("click", onCanvasClick);
		document.addEventListener("pointerlockchange", onPointerLockChange);

		window.addEventListener("mousemove", onMouseEvent);

		window.addEventListener("keydown", onKeyEvent);
		window.addEventListener("keyup", onKeyEvent);
	}
}