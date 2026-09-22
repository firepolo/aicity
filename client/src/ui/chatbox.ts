const chatbox = document.getElementById("chatbox")!

export default {
	show() {
		chatbox.classList.remove("hidden");
		chatbox.focus({
			focusVisible: true
		});
	},

	hide() {
		chatbox.classList.add("hidden");
	}
}