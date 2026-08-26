export class EventBus<T> {
	private map: { [K in keyof T]?: Set<(data: T[K]) => void> } = {};

	off<K extends keyof T>(type: K, callback: (data: T[K]) => void): void {
		const set = this.map[type];
		if (!set) return;

		set.delete(callback);
		if (set.size == 0) delete this.map[type];
	}

	on<K extends keyof T>(type: K, callback: (data: T[K]) => void): void {
		this.map[type] ||= new Set<(data: T[K]) => void>();
		this.map[type].add(callback);
	}

	once<K extends keyof T>(type: K, callback: (data: T[K]) => void): void {
		this.on(type, (data: T[K]) => {
			this.off(type, callback);
			callback(data);
		});
	}

	emit<K extends keyof T>(type: K, data: T[K]): void {
		const set = this.map[type];
		if (!set) return;

		for (const callback of set) callback(data);
	}
}