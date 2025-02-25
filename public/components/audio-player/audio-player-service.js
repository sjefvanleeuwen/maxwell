class AudioPlayerService {
    constructor() {
        this.players = new Set();
        this.currentlyPlaying = null;
    }

    registerPlayer(player) {
        this.players.add(player);
    }

    unregisterPlayer(player) {
        this.players.delete(player);
        if (this.currentlyPlaying === player) {
            this.currentlyPlaying = null;
        }
    }

    play(player) {
        if (this.currentlyPlaying && this.currentlyPlaying !== player) {
            this.currentlyPlaying.pause();
        }
        this.currentlyPlaying = player;
    }
}

// Create a singleton instance
window.audioPlayerService = window.audioPlayerService || new AudioPlayerService();