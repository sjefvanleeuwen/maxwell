class AudioPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.service = window.audioPlayerService;
    }

    connectedCallback() {
        const config = JSON.parse(this.getAttribute('config'));
        this.render(config);
        this.setupAudio(config.url);
        this.setupEventListeners();
        this.service.registerPlayer(this);
    }

    disconnectedCallback() {
        this.service.unregisterPlayer(this);
    }

    render(config) {
        this.shadowRoot.innerHTML = `
            <style>
                .player-container {
                    font-family: Arial, sans-serif;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    width: 300px;
                }
                .title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .author {
                    color: #666;
                    font-size: 0.9em;
                    margin-bottom: 10px;
                }
                .controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                button {
                    padding: 5px 15px;
                    cursor: pointer;
                }
                .time {
                    font-family: monospace;
                }
                .progress-container {
                    width: 100%;
                    height: 24px;
                    background-color: #ddd;
                    border-radius: 12px;
                    margin: 10px 0;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                .progress-bar {
                    width: 0%;
                    height: 100%;
                    background-color: #5CB8E4;
                    border-radius: 12px;
                    transition: width 0.1s linear;
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0.4;
                }
                .waveform-img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
            </style>
            <div class="player-container">
                <div class="title">${config.title}</div>
                <div class="author">${config.author}</div>
                <div class="progress-container">
                    <img class="waveform-img" 
                         src="waveforms/${this.getWaveformName(config.url)}"
                         onload="this.style.opacity = 1"
                         onerror="this.remove()">
                    <div class="progress-bar"></div>
                </div>
                <div class="controls">
                    <button class="play-pause">Play</button>
                    <span class="time">0:00/0:00</span>
                </div>
                <audio style="display: none;"></audio>
            </div>
        `;
    }

    getWaveformName(url) {
        const filename = url.split('/').pop();
        const basename = filename.split('.')[0];
        return `${basename}.png`;
    }

    setupAudio(url) {
        this.audio = this.shadowRoot.querySelector('audio');
        this.audio.src = url;
        this.audio.addEventListener('timeupdate', () => this.updateTime());
        this.audio.addEventListener('loadedmetadata', () => this.updateTime());
    }

    setupEventListeners() {
        const playPauseBtn = this.shadowRoot.querySelector('.play-pause');
        playPauseBtn.addEventListener('click', () => this.togglePlay());
        const progressContainer = this.shadowRoot.querySelector('.progress-container');
        progressContainer.addEventListener('click', (e) => this.seek(e));
    }

    togglePlay() {
        const playPauseBtn = this.shadowRoot.querySelector('.play-pause');
        if (this.audio.paused) {
            this.service.play(this);
            this.audio.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            this.pause();
        }
    }

    pause() {
        const playPauseBtn = this.shadowRoot.querySelector('.play-pause');
        this.audio.pause();
        playPauseBtn.textContent = 'Play';
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateTime() {
        const timeDisplay = this.shadowRoot.querySelector('.time');
        const progressBar = this.shadowRoot.querySelector('.progress-bar');
        const currentTime = this.formatTime(this.audio.currentTime);
        const duration = this.formatTime(this.audio.duration || 0);
        const progress = (this.audio.currentTime / this.audio.duration) * 100 || 0;
        
        timeDisplay.textContent = `${currentTime}/${duration}`;
        progressBar.style.width = `${progress}%`;
    }

    seek(e) {
        const progressContainer = this.shadowRoot.querySelector('.progress-container');
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = pos * this.audio.duration;
        
        // If the player is paused, start playing from the new position
        if (this.audio.paused) {
            this.togglePlay();
        }
    }
}

customElements.define('audio-player', AudioPlayer);