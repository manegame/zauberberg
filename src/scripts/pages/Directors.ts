import Page from "./Page";

import { gsap } from "gsap";

// @ts-ignore
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export default class DirectorsPage extends Page {
    DELTA_MULTIPLIER: number;
    ITEM_HEIGHT: number;
    MAX_SCROLL_SPEED: number;
    NUMBER_OF_DUPLICATES: number;

    y!: number;

    videoEl!: HTMLVideoElement;
    list!: HTMLElement;
    ghostList!: HTMLElement;
    directors!: NodeListOf<HTMLElement>;
    totalItems!: number;

    currentIndex!: number;
    currentDirector!: HTMLElement;

    allVideos!: string[];
    videosToLoad!: string[];
    preloadedVideoBlobs!: Map<string, string>;

    scrollTo!: any;
    ghostScrollTo!: any;
    wrap!: (index: number) => number;

    scrollEndTimeout?: number;
    observer!: Observer;

    constructor() {
        super();

        this.DELTA_MULTIPLIER = 1;
        this.ITEM_HEIGHT = 26;
        this.MAX_SCROLL_SPEED = 20;
        this.NUMBER_OF_DUPLICATES = 2;

        this.container = document.querySelector(
            "#directors-page",
        ) as HTMLElement;
    }

    destroy() {
        super.destroy();
        if (this.observer) this.observer.kill();
        if (this.scrollEndTimeout) clearTimeout(this.scrollEndTimeout);

        // Clean up blob URLs to free memory
        this.preloadedVideoBlobs.forEach((blobUrl) => {
            URL.revokeObjectURL(blobUrl);
        });
        this.preloadedVideoBlobs.clear();
    }

    async init() {
        if (!this.container) return;

        this.setupInfiniteScroll();
        await this.loadAndSetFirstVideo();
        this.preloadOtherVideos();

        await super.init();
    }

    private async fetchVideoAsBlob(videoUrl: string): Promise<string> {
        if (this.preloadedVideoBlobs.has(videoUrl)) {
            return this.preloadedVideoBlobs.get(videoUrl)!;
        }

        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error(
                `Failed to fetch ${videoUrl}: ${response.statusText}`,
            );
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        this.preloadedVideoBlobs.set(videoUrl, blobUrl);

        this.videosToLoad = this.videosToLoad.filter((vid) => vid !== videoUrl);

        return blobUrl;
    }

    async loadAndSetFirstVideo() {
        this.videoEl = this.container.querySelector(
            "#director-video",
        ) as HTMLVideoElement;

        const firstVideoUrl = this.currentDirector.dataset.video!;
        await this.fetchVideoAsBlob(firstVideoUrl);

        this.setBackgroundVideo();

        return new Promise<void>((resolve) => {
            this.videoEl.addEventListener(
                "loadeddata",
                () => {
                    console.log(`Video ready: ${firstVideoUrl}`);
                    resolve();
                },
                { once: true },
            );
        });
    }

    async preloadOtherVideos() {
        const videosToPreload = [...this.videosToLoad];

        const preloadPromises = videosToPreload.map(async (videoUrl) => {
            try {
                await this.fetchVideoAsBlob(videoUrl);
                console.log(`Preloaded: ${videoUrl}`);
            } catch (error) {
                console.error(`Failed to preload ${videoUrl}:`, error);
            }
        });

        await Promise.allSettled(preloadPromises);
        console.log(`Preloaded ${this.preloadedVideoBlobs.size} videos`);
    }

    onScrollEvent(scroll: any) {
        if (this.scrollEndTimeout) clearTimeout(this.scrollEndTimeout);

        const deltaY = Math.max(
            -this.MAX_SCROLL_SPEED,
            Math.min(this.MAX_SCROLL_SPEED, scroll.deltaY),
        );

        this.y += deltaY * this.DELTA_MULTIPLIER;

        this.scrollTo(this.y);
        this.ghostScrollTo(this.y);

        this.scrollEndTimeout = setTimeout(() => {
            this.onScrollEnd();
        }, 100) as any;
    }

    onScrollEnd() {
        this.snapToGrid();
        this.selectCurrentDirectorFromScroll();
    }

    setBackgroundVideo() {
        const videoUrl = this.currentDirector.dataset.video!;
        const videoPoster = this.currentDirector.dataset.poster!;

        const srcToUse = this.preloadedVideoBlobs.get(videoUrl) || videoUrl;

        this.videoEl.src = srcToUse;
        this.videoEl.poster = videoPoster;
        this.videoEl.load();
    }

    selectCurrentDirectorFromScroll() {
        const wrappedY = this.wrap(this.y);
        const centerIndex =
            Math.round(-wrappedY / this.ITEM_HEIGHT) % this.totalItems;

        if (centerIndex === this.currentIndex) return;

        this.setCurrentDirectorByIndex(centerIndex);
        this.setBackgroundVideo();
    }

    setCurrentDirectorByIndex(index: number) {
        this.currentIndex = index;
        this.currentDirector = this.directors[index];

        console.log(
            "setting director: ",
            index,
            this.directors[index].dataset.director,
        );
    }

    snapToGrid() {
        const roundedY =
            Math.round(this.y / this.ITEM_HEIGHT) * this.ITEM_HEIGHT;

        if (Math.abs(this.y - roundedY) > 0.1) {
            this.y = roundedY;
            this.scrollTo(this.y);
            this.ghostScrollTo(this.y);
            console.log("snapping", this.y);
        }
    }

    setInitialDirector() {
        const randomIndex = Math.floor(Math.random() * this.totalItems);

        const initialOffset =
            (randomIndex + this.totalItems) * -this.ITEM_HEIGHT;

        this.y = this.wrap(initialOffset);
        gsap.set([this.list, this.ghostList], { y: this.y });

        this.setCurrentDirectorByIndex(randomIndex);
    }

    setupInfiniteScroll() {
        this.list = this.container.querySelector(
            "#directors-list",
        ) as HTMLElement;
        this.ghostList = this.container.querySelector(
            "#directors-ghost-list",
        ) as HTMLElement;

        this.directors = this.list.querySelectorAll(".director-item");
        this.totalItems = this.directors.length / this.NUMBER_OF_DUPLICATES;

        this.allVideos = Array.from(this.directors).map(
            (dir) => dir.dataset.video!,
        );
        this.videosToLoad = Array.from(new Set(this.allVideos));
        this.preloadedVideoBlobs = new Map();

        // Only when NUMBER_OF_DUPLICATES is 2
        // TODO: make it work for any number of duplicates
        this.wrap = gsap.utils.wrap(
            (-this.list.offsetHeight / 4) * 3,
            -this.list.offsetHeight / 4,
        );

        this.setInitialDirector();

        this.scrollTo = gsap.quickTo(this.list, "y", {
            ease: "power3",
            duration: 1.2,
            modifiers: {
                y: gsap.utils.unitize(this.wrap),
            },
        });

        this.ghostScrollTo = gsap.quickTo(this.ghostList, "y", {
            ease: "power3",
            duration: 1.2,
            modifiers: {
                y: gsap.utils.unitize(this.wrap),
            },
        });

        this.observer = Observer.create({
            target: this.container,
            type: "wheel,touch,pointer",
            wheelSpeed: -0.25,
            onChangeY: (self) => {
                this.onScrollEvent(self);
            },
        });
    }
}
