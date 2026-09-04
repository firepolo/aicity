import { UUID } from "node:crypto";

const index2char = "0123456789abcdef";
const char2index = Object.fromEntries(index2char.split("").map((c, i) => [c, i]));

export default {
	to128(uuid: UUID): [number, number] {
		return [
			(char2index[uuid[0]] << 60) |
			(char2index[uuid[1]] << 56) |
			(char2index[uuid[2]] << 52) |
			(char2index[uuid[3]] << 48) |
			(char2index[uuid[4]] << 44) |
			(char2index[uuid[5]] << 40) |
			(char2index[uuid[6]] << 36) |
			(char2index[uuid[7]] << 32) |
			// -
			(char2index[uuid[9]] << 28) |
			(char2index[uuid[10]] << 24) |
			(char2index[uuid[11]] << 20) |
			(char2index[uuid[12]] << 16) |
			// -
			(char2index[uuid[14]] << 12) |
			(char2index[uuid[15]] << 8) |
			(char2index[uuid[16]] << 4) |
			(char2index[uuid[17]]),
			// -
			(char2index[uuid[19]] << 60) |
			(char2index[uuid[20]] << 56) |
			(char2index[uuid[21]] << 52) |
			(char2index[uuid[22]] << 48) |
			// -
			(char2index[uuid[24]] << 44) |
			(char2index[uuid[25]] << 40) |
			(char2index[uuid[26]] << 36) |
			(char2index[uuid[27]] << 32) |
			(char2index[uuid[28]] << 28) |
			(char2index[uuid[29]] << 24) |
			(char2index[uuid[30]] << 20) |
			(char2index[uuid[31]] << 16) |
			(char2index[uuid[32]] << 12) |
			(char2index[uuid[33]] << 8) |
			(char2index[uuid[34]] << 4) |
			(char2index[uuid[35]])
		];
	},

	from128(high: number, low: number): string {
		return index2char[(high >> 60) & 0xf] +
			index2char[(high >> 56) & 0xf] +
			index2char[(high >> 52) & 0xf] +
			index2char[(high >> 48) & 0xf] +
			index2char[(high >> 44) & 0xf] +
			index2char[(high >> 40) & 0xf] +
			index2char[(high >> 36) & 0xf] +
			index2char[(high >> 32) & 0xf] +
			"-" +
			index2char[(high >> 28) & 0xf] +
			index2char[(high >> 24) & 0xf] +
			index2char[(high >> 20) & 0xf] +
			index2char[(high >> 16) & 0xf] +
			"-" +
			index2char[(high >> 12) & 0xf] +
			index2char[(high >> 8) & 0xf] +
			index2char[(high >> 4) & 0xf] +
			index2char[high & 0xf] +
			"-" +
			index2char[(low >> 60) & 0xf] +
			index2char[(low >> 56) & 0xf] +
			index2char[(low >> 52) & 0xf] +
			index2char[(low >> 48) & 0xf] +
			"-" +
			index2char[(low >> 44) & 0xf] +
			index2char[(low >> 40) & 0xf] +
			index2char[(low >> 36) & 0xf] +
			index2char[(low >> 32) & 0xf] +
			index2char[(low >> 28) & 0xf] +
			index2char[(low >> 24) & 0xf] +
			index2char[(low >> 20) & 0xf] +
			index2char[(low >> 16) & 0xf] +
			index2char[(low >> 12) & 0xf] +
			index2char[(low >> 8) & 0xf] +
			index2char[(low >> 4) & 0xf] +
			index2char[low & 0xf];
	}
}