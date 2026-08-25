import { Vec3 } from "@/math/vec3";
import { keys, mouse, mouseLocked } from "@/core/input";
import camera from "@/core/camera";

export class Player {
	private position: Vec3 = new Vec3(0.0, 0.0, 0.0);
	private direction: Vec3 = new Vec3(0.0, 0.0, -1.0);
	private headOffset: Vec3 = new Vec3(0.0, 10, 0.0);
	private head: Vec3 = new Vec3(0.0, 10, 0.0);

	updateCamera(): void {
		this.head.set(Vec3.add(this.position, this.headOffset));
		camera.update(this.head, this.direction);
	}

	input(elapsedTime: number) {
		if (mouseLocked) {
			if (mouse.x != 0) {
				camera.yaw += mouse.x * elapsedTime * 0.2;
				this.direction.setXYZ(Math.sin(camera.yaw), 0.0, -Math.cos(camera.yaw));
				this.updateCamera();
				mouse.x = 0;
			}
			if (mouse.y != 0) {
				camera.pitch = camera.pitch - mouse.y * elapsedTime * 0.2;
				this.direction.setXYZ(Math.sin(camera.yaw), 0.0, -Math.cos(camera.yaw));
				this.updateCamera();
				mouse.y = 0;
			}
		}

		if (keys["KeyW"]) {
			this.position.x += this.direction.x * elapsedTime * 50;
			this.position.z += this.direction.z * elapsedTime * 50;
			this.updateCamera();
		}
		else if (keys["KeyS"]) {
			this.position.x -= this.direction.x * elapsedTime * 50;
			this.position.z -= this.direction.z * elapsedTime * 50;
			this.updateCamera();
		}

		if (keys["KeyA"]) {
			this.position.x += this.direction.z * elapsedTime * 50;
			this.position.z -= this.direction.x * elapsedTime * 50;
			this.updateCamera();
		}
		else if (keys["KeyD"]) {
			this.position.x -= this.direction.z * elapsedTime * 50;
			this.position.z += this.direction.x * elapsedTime * 50;
			this.updateCamera();
		}
	}
}