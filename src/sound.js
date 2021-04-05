export default class Sound {

    constructor(file, duration) {
        this.root = "https://rahmanyerli.github.io/BubblePopping/assets/sounds/"
        this.audio = document.createElement("audio")
        if (location.href === "http://127.0.0.1:5500/") {
            this.root = "../assets/sounds/"
        }
        this.audio.src = `${this.root}${file}`
        this.audio.setAttribute("preload", "auto")
        this.audio.setAttribute("controls", "none")
        this.audio.style.display = "none"
        this.duration = duration
    }

    play() {
        this.audio.volume = 0.2
        this.audio.play()
    }

    stop() {
        setTimeout(() => {
            this.audio.pause()
        }, this.duration);
    }
}