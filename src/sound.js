export default class Sound {

    constructor(file, duration) {
        this.audio = document.createElement("audio")
        this.audio.src = `https://rahmanyerli.github.io/BubblePopping/assets/sounds/${file}`
        this.audio.setAttribute("preload", "auto")
        this.audio.setAttribute("controls", "none")
        this.audio.style.display = "none"
        this.duration = duration
        document.body.appendChild(this.audio)
    }

    play() {
        this.audio.volume = 0.2
        this.audio.play()
    }

    stop() {
        setTimeout(() => {
            this.audio.pause()
            document.body.removeChild(this.audio)
        }, this.duration);
    }
}