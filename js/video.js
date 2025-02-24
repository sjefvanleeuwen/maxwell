class VideoCarousel {
    constructor() {
        this.videos = [
            { id: 'm1IdyJAKnlo', title: 'Sjef van Leeuwen ft. Isla Deimos - Fractured (Official Video)', description: 'A dystopian world crumbles—fractured beings trapped in a system that pulls their strings. Society is a machine, its people conditioned, controlled, and bound by unseen forces. Among them, a pilot is chosen, not by fate, but by design. Subjected to rigorous conditioning, their mind and body are reshaped for long-duration spaceflight—endless simulations, isolation tests, and neural programming ensuring absolute resilience.As the world spirals further into collapse, fire and ruin swallowing the last remnants of civilization, the pilot steps into the ark-class spaceship—humanity’s final escape. Engines ignite, metal groans against the weight of the past, and the ship ascends, breaking free from the dying world below. Drifting into the void, the pilot leaves behind the fractured remnants of the old and ventures toward the unknown—a chance to start anew beyond the stars.'},
            { id: 'p2m-_3ThYQs', title: 'Maxwell Pierce - Eternal Pyric Sands (Official Video)', description: 'Eternal Pyric Sands is a deep ethnic progressive house track that evokes a vast, dune-like atmosphere. It immerses listeners in a sci-fi-inspired soundscape reminiscent of Dune, blending Middle Eastern futurism with an outerworldly essence. The composition carries a sense of mysticism, infused with religious undertones and the tension of war, creating a cinematic journey through an ancient yet technologically advanced desert realm.'},
            { id: 'Aikq-TwqSEY', title: 'Tron Legacy II - Reforged (Fan Trailer)', description: 'Tron Legacy II - Reforged (Fan Trailer) is a thrilling continuation of the Tron saga, reimagined through a fan-made vision. The trailer sets the stage with the revelation that The Grid, once believed to be destroyed, was never truly gone—it was merely dormant, waiting. As the system stirs back to life, a catastrophic failure occurs, hinting at a deeper truth: CLU may not have been fully decompiled as previously thought. The digital world reawakens, proving that The Grid was never meant to die. With stunning visuals, intense electronic soundscapes, and a gripping narrative, this fan trailer teases a rebirth of the cyber-realm, where old threats and new mysteries collide.' },
            { id: 'VQeKGq-pENM', title: 'Atherion - Opening Title Sequence', description: 'In a galaxy called Atherion, a war between ancient machine sentinels and organic civilizations is reignited after centuries of peace. The series explores survival, identity, and the meaning of freedom within the vast expanse of Atherion.' }
        ];
        this.currentIndex = 0;
        this.videoSection = document.querySelector('.video-section');
        this.player = null;
        this.isPiP = false;
        this.init();
    }

    init() {
        this.renderCarousel();
        this.setupControls();
        this.loadYouTubeAPI();
    }

    renderCarousel() {
        const template = `
            <div class="video-carousel">
                <button class="carousel-nav prev" aria-label="Previous video">
                    <svg width="24" height="48" viewBox="0 0 24 48" fill="none" stroke="currentColor">
                        <path d="M20 44L4 24L20 4" stroke-width="2"/>
                    </svg>
                </button>
                <div class="video-container">
                    <iframe allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                </div>
                <button class="carousel-nav next" aria-label="Next video">
                    <svg width="24" height="48" viewBox="0 0 24 48" fill="none" stroke="currentColor">
                        <path d="M4 44L20 24L4 4" stroke-width="2"/>
                    </svg>
                </button>
                <div class="carousel-indicators"></div>
            </div>
            <div class="video-info">
                <h3 class="video-title"></h3>
                <p class="video-description"></p>
            </div>
        `;
        
        this.videoSection.innerHTML = template;
        this.createIndicators();
        this.videoFrame = this.videoSection.querySelector('iframe');
    }

    setupControls() {
        const prev = this.videoSection.querySelector('.prev');
        const next = this.videoSection.querySelector('.next');
        prev.addEventListener('click', () => this.navigate(-1));
        next.addEventListener('click', () => this.navigate(1));
    }

    createIndicators() {
        const container = this.videoSection.querySelector('.carousel-indicators');
        this.videos.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.addEventListener('click', () => this.goToVideo(i));
            container.appendChild(dot);
        });
    }

    loadYouTubeAPI() {
        if (window.YT) {
            this.setupVideo();
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => this.setupVideo();
    }

    setupVideo() {
        if (!this.videoFrame) {
            console.error('Video frame not found');
            return;
        }

        const videoId = this.videos[this.currentIndex].id;
        
        // Set initial video URL while API loads
        this.videoFrame.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;

        if (window.YT && window.YT.Player) {
            if (this.player) {
                this.player.loadVideoById(videoId);
            } else {
                this.player = new YT.Player(this.videoFrame, {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0
                    },
                    events: {
                        onReady: () => this.setupIntersectionObserver(),
                        onStateChange: (event) => this.handlePlayerStateChange(event)
                    }
                });
            }
        }
        
        this.updateInfo();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.2 }
        );
        observer.observe(this.videoSection);
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (!this.player?.getPlayerState) return;

            const isPlaying = this.player.getPlayerState() === YT.PlayerState.PLAYING;
            
            if (!entry.isIntersecting && isPlaying && !this.isPiP) {
                this.enablePiP();
            } else if (entry.isIntersecting && this.isPiP) {
                this.disablePiP();
            }
        });
    }

    handlePlayerStateChange(event) {
        if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            this.disablePiP();
        }
    }

    enablePiP() {
        if (!this.videoFrame) return;
        this.isPiP = true;
        this.videoFrame.setAttribute('pip', '');
    }

    disablePiP() {
        if (!this.videoFrame) return;
        this.isPiP = false;
        this.videoFrame.removeAttribute('pip');
    }

    navigate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.videos.length) % this.videos.length;
        this.setupVideo();
        this.updateIndicators();
    }

    goToVideo(index) {
        this.currentIndex = index;
        this.setupVideo();
        this.updateIndicators();
    }

    updateInfo() {
        const video = this.videos[this.currentIndex];
        this.videoSection.querySelector('.video-title').textContent = video.title;
        this.videoSection.querySelector('.video-description').textContent = video.description;
    }

    updateIndicators() {
        const dots = this.videoSection.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
}

// Initialize video handler
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new VideoCarousel();
    window.videoCarousel = carousel; // For debugging
});
