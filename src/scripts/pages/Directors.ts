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

    videoEl1!: HTMLVideoElement;
    videoEl2!: HTMLVideoElement;
    activeVideoEl!: HTMLVideoElement;
    inactiveVideoEl!: HTMLVideoElement;
    crossfadeTimeline!: gsap.core.Timeline;
    list!: HTMLElement;
    ghostList!: HTMLElement;
    directors!: NodeListOf<HTMLElement>;
    totalItems!: number;

    currentIndex!: number;
    currentDirector!: HTMLElement;

    allVideos!: { video: string; index: number }[];
    videosToLoad!: { video: string; index: number }[];
    preloadedVideoBlobs!: Map<string, string>;

    scrollTo!: any;
    ghostScrollTo!: any;
    wrap!: (index: number) => number;

    scrollEndTimeout?: number;
    observer!: Observer;

    constructor(...args: ConstructorParameters<typeof Page>) {
        super(...args);

        this.DELTA_MULTIPLIER = 1;
        this.ITEM_HEIGHT = 26;
        this.MAX_SCROLL_SPEED = 20;
        this.NUMBER_OF_DUPLICATES = 2;
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

    async fetchVideoAsBlob(videoUrl: string): Promise<string> {
        if (this.preloadedVideoBlobs.has(videoUrl)) {
            return this.preloadedVideoBlobs.get(videoUrl)!;
        }

        const response = await fetch("/api/getWiredriveVideo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ video: videoUrl }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to fetch ${videoUrl}: ${response.statusText}`,
            );
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        this.preloadedVideoBlobs.set(videoUrl, blobUrl);

        this.videosToLoad = this.videosToLoad.filter(
            (vid) => vid.video !== videoUrl,
        );

        return blobUrl;
    }

    async loadAndSetFirstVideo() {
        this.videoEl1 = this.container.querySelector(
            "#director-video-1",
        ) as HTMLVideoElement;

        this.videoEl2 = this.container.querySelector(
            "#director-video-2",
        ) as HTMLVideoElement;

        this.activeVideoEl = this.videoEl1;
        this.inactiveVideoEl = this.videoEl2;

        const firstVideoUrl = this.currentDirector.dataset.video!;
        await this.fetchVideoAsBlob(firstVideoUrl);

        this.activeVideoEl.poster = this.currentDirector.dataset.poster!;
        this.activeVideoEl.src =
            this.preloadedVideoBlobs.get(firstVideoUrl) || firstVideoUrl;
        this.activeVideoEl.load();

        return new Promise<void>((resolve) => {
            this.activeVideoEl.addEventListener(
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
        const initialIndex = this.currentIndex;

        const getCircularDistance = (fromIndex: number, toIndex: number) => {
            const directDist = Math.abs(toIndex - fromIndex);
            const wrapDist = this.totalItems - directDist;
            return Math.min(directDist, wrapDist);
        };

        // We sort them based on their distance from the initial index
        this.videosToLoad.sort((a, b) => {
            const distA = getCircularDistance(initialIndex, a.index);
            const distB = getCircularDistance(initialIndex, b.index);
            return distA - distB;
        });

        const videosToPreload = [...this.videosToLoad];

        console.log(
            "Videos to preload in order:",
            videosToPreload.map((v) => v.index),
        );

        const preloadPromises = videosToPreload.map(async ({ video }) => {
            try {
                await this.fetchVideoAsBlob(video);
                console.log(`Preloaded: ${video}`);
            } catch (error) {
                console.error(`Failed to preload ${video}:`, error);
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

        // decomment later, for now we have the same video for all directors so we want to see the transi
        // if (this.inactiveVideoEl.src === srcToUse) return;

        this.inactiveVideoEl.src = srcToUse;
        this.inactiveVideoEl.poster = videoPoster;
        this.inactiveVideoEl.load();

        this.startCrossfadeWhenReady();
    }

    startCrossfadeWhenReady() {
        this.crossfadeTimeline?.kill();
        this.crossfadeTimeline = gsap
            .timeline({ paused: true })
            .set(this.inactiveVideoEl, { zIndex: 2 })
            .set(this.activeVideoEl, { zIndex: 1 })
            .to(this.inactiveVideoEl, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
            })
            .call(() => {
                // Swap active/inactive references
                [this.activeVideoEl, this.inactiveVideoEl] = [
                    this.inactiveVideoEl,
                    this.activeVideoEl,
                ];

                gsap.set(this.inactiveVideoEl, { opacity: 0 });
            });

        if (this.inactiveVideoEl.readyState >= 3) {
            this.crossfadeTimeline.play();
        } else {
            this.inactiveVideoEl.addEventListener(
                "loadeddata",
                () => {
                    this.crossfadeTimeline.play();
                },
                { once: true },
            );
        }
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

        const allVideos = Array.from(this.directors).map((dir) => ({
            video: dir.dataset.video!,
            index: parseInt(dir.dataset.index!),
        }));

        // Remove duplicates
        this.videosToLoad = Array.from(
            new Set(allVideos.map((v) => v.video)),
        ).map((video) => {
            return allVideos.find((v) => v.video === video)!;
        });

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
