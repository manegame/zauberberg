import Page from "./Page";
import gsap from "gsap";

export default class Video extends Page {
    abortController!: AbortController;
    video!: HTMLVideoElement | null;
    controls!: HTMLElement | null;
    btnSound!: HTMLElement | null;
    progressTl!: gsap.core.Timeline;
    muted!: boolean;
    isSetup!: boolean;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.video = this.container.querySelector("#video-video video")!;
        this.abortController = new AbortController();
        this.muted = true;
        this.isSetup = false;

        if (this.video?.readyState >= 2) this.setupVideoControls();

        this.video.addEventListener(
            "loadedmetadata",
            () => {
                this.setupVideoControls();
            },
            {
                signal: this.abortController.signal,
            },
        );

        await super.init();
    }

    onTimeUpdate() {
        const timeEl = this.container.querySelector("#video-controls-time");
        if (!timeEl) return;

        const currentTime = this.video!.currentTime;

        const minutes = Math.round(currentTime / 60)
            .toString()
            .padStart(2, "0");
        const seconds = Math.round(currentTime % 60)
            .toString()
            .padStart(2, "0");
        timeEl.textContent = `${minutes}:${seconds}`;
    }

    onSoundClick() {
        if (!this.video) return;
        this.muted = !this.muted;
        this.video.muted = this.muted;

        if (this.btnSound) {
            this.btnSound.setAttribute(
                "data-muted",
                this.muted ? "true" : "false",
            );
        }
    }

    setupTimeline() {
        if (!this.video || !this.controls) return;

        this.progressTl = gsap.timeline({ paused: true, repeat: -1 });
        this.progressTl.to(this.controls, {
            "--video-progress": 1,
            duration: this.video.duration,
            ease: "none",
        });
        this.progressTl.play();

        this.video.addEventListener(
            "timeupdate",
            () => {
                this.onTimeUpdate();
            },
            { signal: this.abortController.signal },
        );
    }

    setupButtons() {
        if (!this.video) return;

        this.btnSound = this.container.querySelector("#btn-sound");

        this.btnSound?.addEventListener(
            "click",
            () => {
                this.onSoundClick();
            },
            { signal: this.abortController.signal },
        );
    }

    setupVideoControls() {
        if (!this.video || this.isSetup) return;
        this.isSetup = true;
        this.controls = this.container.querySelector("#video-controls");

        this.video?.play();
        this.setupTimeline();
        this.setupButtons();
    }

    transitionIn() {
        this.killCurrentSwap();

        const videosInfos = this.container.querySelectorAll(".video-info");
        const videoTimeline =
            this.container.querySelectorAll("#video-timeline");
        const controlsItems = this.container.querySelectorAll(
            "#video-controls .controls-item",
        );

        const video = this.container.querySelector("#video-video");

        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl
            .to(video, {
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
            })
            .to(
                videosInfos,
                {
                    yPercent: 0,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: "power3.inOut",
                },
                "<",
            )
            .to(
                controlsItems,
                {
                    yPercent: 0,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: "power3.inOut",
                },
                "<+=0.2",
            )
            .to(
                videoTimeline,
                {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power3.out",
                },
                "<",
            );

        return this.swapTl.play();
    }

    prepareTransitionIn() {
        const videosInfos = this.container.querySelectorAll(".video-info");
        const videoTimeline =
            this.container.querySelectorAll("#video-timeline");
        const controlsItems = this.container.querySelectorAll(
            "#video-controls .controls-item",
        );
        const video = this.container.querySelector("#video-video");

        gsap.set(video, { opacity: 0 });
        gsap.set(videoTimeline, { opacity: 0 });
        gsap.set(controlsItems, { yPercent: 100 });
        gsap.set(videosInfos, { yPercent: 100 });
    }
}
