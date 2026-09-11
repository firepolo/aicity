export class Node<T> {
	prev: Node<T> | null = null;
	next: Node<T> | null = null;
	readonly value: T;

	constructor(prev: Node<T> | null, value: T) {
		this.prev = prev;
		this.value = value;
	}
}

export class LinkedList<T> {
	begin: Node<T> | null = null;
	end: Node<T> | null = null;

	push(value: T): Node<T> {
		if (!this.begin) {
			this.begin = new Node(this.end, value);
			this.end = this.begin;
			return this.begin;
		}

		return this.end = this.end!.next = new Node(this.end, value);
	}

	remove(node: Node<T>) {
		node.prev!.next = node.next;
		if (node.next) node.next.prev = node.prev;
		else this.end = node.prev;
		if (!node.prev) this.begin = node.next;
	}
}