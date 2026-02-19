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

    allVideos!: { video: string; index: number }[];
    videosToLoad!: { video: string; index: number }[];

    scrollTo!: any;
    ghostScrollTo!: any;
    wrap!: (index: number) => number;

    scrollEndTimeout?: number;
    observer!: Observer;
    abortController!: AbortController;

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
    }

    async init() {
        if (!this.container) return;

        this.abortController = new AbortController();

        this.setupInfiniteScroll();
        await this.loadAndSetFirstVideo();
        this.preloadOtherVideos();

        await super.init();
    }

    async fetchVideoAsBlob(videoUrl: string): Promise<string> {
        if (this.app.store.homeVideoBlobs.has(videoUrl)) {
            return this.app.store.homeVideoBlobs.get(videoUrl)!;
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

        this.app.store.homeVideoBlobs.set(videoUrl, blobUrl);

        this.videosToLoad = this.videosToLoad.filter(
            (vid) => vid.video !== videoUrl,
        );

        return blobUrl;
    }

    async loadAndSetFirstVideo() {
        this.videoEl = this.container.querySelector(
            "#director-video",
        ) as HTMLVideoElement;

        this.videoEl.poster = this.currentDirector.dataset.poster!;
        this.videoEl.load();
        const firstVideoUrl = this.currentDirector.dataset.video!;
        await this.fetchVideoAsBlob(firstVideoUrl);

        this.videoEl.src =
            this.app.store.homeVideoBlobs.get(firstVideoUrl) || firstVideoUrl;

        return new Promise<void>((resolve) => {
            this.videoEl.addEventListener(
                "loadeddata",
                () => {
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

        const preloadPromises = videosToPreload.map(async ({ video }) => {
            try {
                await this.fetchVideoAsBlob(video);
            } catch (error) {
                console.error(`Failed to preload ${video}:`, error);
            }
        });

        await Promise.allSettled(preloadPromises);
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
        const srcToUse =
            this.app.store.homeVideoBlobs.get(videoUrl) || videoUrl;

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
    }

    snapToGrid() {
        const roundedY =
            Math.round(this.y / this.ITEM_HEIGHT) * this.ITEM_HEIGHT;

        if (Math.abs(this.y - roundedY) > 0.1) {
            this.y = roundedY;
            this.scrollTo(this.y);
            this.ghostScrollTo(this.y);
        }
    }

    setInitialDirector() {
        let index = -1;

        if (this.previousPage?.template === "director") {
            const directorIndex = Array.from(this.directors).findIndex(
                (dir) => `/${dir.dataset.slug}` === this.previousUrl,
            );
            index = directorIndex;
        }

        if (index === -1) {
            const randomIndex = Math.floor(Math.random() * this.totalItems);
            index = randomIndex;
        }

        const initialOffset = (index + this.totalItems) * -this.ITEM_HEIGHT;

        this.y = this.wrap(initialOffset);
        gsap.set([this.list, this.ghostList], { y: this.y });

        this.setCurrentDirectorByIndex(index);
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

        // persistent store between page swaps
        if (!this.app.store.homeVideoBlobs) {
            this.app.store.homeVideoBlobs = new Map();
        }

        // Only when NUMBER_OF_DUPLICATES is 2
        // TODO: make it work for any number of duplicates
        this.wrap = gsap.utils.wrap(
            (-this.list.offsetHeight / 4) * 3,
            -this.list.offsetHeight / 4,
        );

        this.setInitialDirector();

        this.scrollTo = gsap.quickTo(this.list, "y", {
            ease: "power2",
            duration: 0.6,
            modifiers: {
                y: gsap.utils.unitize(this.wrap),
            },
        });

        this.ghostScrollTo = gsap.quickTo(this.ghostList, "y", {
            ease: "power2",
            duration: 0.6,
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

        this.directors.forEach((director) => {
            director.addEventListener(
                "click",
                (e) => {
                    this.onDirectorClick(director);
                },
                { signal: this.abortController.signal },
            );
        });
    }

    onDirectorClick(director: HTMLElement) {
        const index = parseInt(director.dataset.index!);
        this.setCurrentDirectorByIndex(index);
        this.setBackgroundVideo();
    }

    transitionOut({
        sourceElement,
        to,
    }: {
        sourceElement: HTMLElement;
        to: string;
    }): Promise<any> | gsap.core.Timeline {
        this.swapTl = gsap.timeline({ paused: true });

        if (to === "work") {
            this.swapTl.to([this.list, this.ghostList], {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            });
        } else if (to === "director") {
            this.swapTl.to([this.list, this.ghostList], {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            });
        } else {
            this.swapTl.to(this.container, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
            });
        }

        return this.swapTl.play();
    }

    transitionIn() {
        this.swapTl = gsap.timeline({ paused: true });

        if (this.previousPage?.template === "director") {
            const lists = this.container.querySelectorAll(
                "#directors-list, #directors-ghost-list",
            );
            this.swapTl.to(lists, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        } else {
            this.swapTl.to(this.container, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        }

        this.updateHeaderItems();

        return this.swapTl.play();
    }

    prepareTransitionIn() {
        if (this.previousPage?.template === "director") {
            const lists = this.container.querySelectorAll(
                "#directors-list, #directors-ghost-list",
            );
            gsap.set(lists, { opacity: 0 });
        } else {
            gsap.set(this.container, { opacity: 0 });
        }
    }
}
