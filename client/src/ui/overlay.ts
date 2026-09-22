export default {
	setTitle(text: string) {
		document.getElementById("overlay-title")!.textContent = text;
	},

	setSubTitle(text: string) {
		document.getElementById("overlay-subtitle")!.textContent = text;
	},

	show() {
		document.getElementById("overlay")!.classList.remove("hidden");
	},

	hide() {
		document.getElementById("overlay")!.classList.add("hidden");
	}
}