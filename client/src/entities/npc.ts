import { Entity } from "./entity";

export class Npc extends Entity {
	private readonly id: number;
	private readonly hair: number;
	private readonly eye: number;

	constructor(id: number, hair: number, eye: number) {
		super(5.0);
		this.id = id;
		this.hair = hair;
		this.eye = eye;
	}

	update(elapsedTime: number) {
	}
}