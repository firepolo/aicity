export enum GameEventType {
	Level_Generate
}

export type GameEventString = {
	data: string
};

export type GameEvent = {
	type: GameEventType;
};

export type LevelGenerateGameEvent = GameEvent & GameEventString;

export type GameEventCallback = () => void;

const listeners: Record<GameEventType, GameEventCallback[]> = {};

export default {
	invoke(event: GameEvent) {
	},

	on(type: GameEventType, callback: GameEventCallback) {
		listeners[type].push(callback);
	}
};