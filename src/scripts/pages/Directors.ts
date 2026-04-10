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
    ITEM_TOP_PADDING: number;

    y!: number;

    videoEl!: HTMLVideoElement;
    lowPowerFallbackEl!: HTMLImageElement;

    // Mobile (single list)
    list!: HTMLElement;
    listWrapper!: HTMLElement;
    directors!: HTMLElement[];
    totalItems!: number;
    totalDirectors!: number; // total unique directors (for video preload distance)
    scrollTo!: any;
    wrap!: (index: number) => number;

    centerOffset: number = 0; // vertical offset to center selected item in wrapper

    // Desktop (three columns)
    isDesktop: boolean = false;
    columnLists!: HTMLElement[];
    columnWraps!: ((n: number) => number)[];
    columnScrollTos!: any[];
    columnDirectors!: HTMLElement[][];
    allDesktopDirectors!: HTMLElement[];

    centerIndex!: number;
    centerDirector!: HTMLElement;
    currentIndex!: number;
    currentDirector!: HTMLElement;

    allVideos!: { video: string; index: number }[];
    videosToLoad!: { video: string; index: number }[];
    isLowPowerMode: boolean = false;

    scrollEndTimeout?: number;
    observer!: Observer;
    abortController!: AbortController;
    preventHover: boolean = false;

    constructor(...args: ConstructorParameters<typeof Page>) {
        super(...args);

        this.DELTA_MULTIPLIER = 1;
        this.ITEM_HEIGHT = 20;
        this.MAX_SCROLL_SPEED = 20;
        this.NUMBER_OF_DUPLICATES = 2;
        this.ITEM_TOP_PADDING = 0;
    }

    destroy() {
        this.abortController.abort();
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
            signal: this.abortController.signal,
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

        this.lowPowerFallbackEl = this.container.querySelector(
            "#low-power-fallback",
        ) as HTMLImageElement;

        this.lowPowerFallbackEl.src = this.currentDirector.dataset.poster!;
        this.videoEl.poster = this.currentDirector.dataset.poster!;
        this.videoEl.load();

        this.videoEl.play().catch((error) => {
            if (error.name === "NotAllowedError") {
                this.enableLowPowerModeFallback();
            }
        });

        const firstVideoUrl = this.currentDirector.dataset.video!;
        await this.fetchVideoAsBlob(firstVideoUrl);

        this.videoEl.src =
            this.app.store.homeVideoBlobs.get(firstVideoUrl) || firstVideoUrl;

        return new Promise<void>((resolve) => {
            if (this.isLowPowerMode) {
                resolve();
                return;
            }
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
        const total = this.totalDirectors;

        const getCircularDistance = (fromIndex: number, toIndex: number) => {
            const directDist = Math.abs(toIndex - fromIndex);
            const wrapDist = total - directDist;
            return Math.min(directDist, wrapDist);
        };

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
                if ((error as any)?.name === "AbortError") {
                    return;
                }
                console.error(`Failed to preload ${video}:`, error);
            }
        });

        await Promise.allSettled(preloadPromises);
    }

    enableLowPowerModeFallback() {
        this.isLowPowerMode = true;
        this.videoEl.style.display = "none";
    }

    onScrollEvent(scroll: any) {
        if (this.scrollEndTimeout) clearTimeout(this.scrollEndTimeout);

        const deltaY = Math.max(
            -this.MAX_SCROLL_SPEED,
            Math.min(this.MAX_SCROLL_SPEED, scroll.deltaY),
        );

        this.y += deltaY * this.DELTA_MULTIPLIER;

        this.applyScroll(this.y);

        this.scrollEndTimeout = setTimeout(() => {
            this.onScrollEnd();
        }, 100) as any;

        if (this.centerDirector) {
            this.centerDirector.dataset.center = "false";
        }
        this.clearSelection();
    }

    applyScroll(y: number) {
        if (this.isDesktop) {
            this.columnScrollTos.forEach((scrollTo) => scrollTo(y));
        } else {
            this.scrollTo(y);
        }
    }

    onScrollEnd() {
        this.snapToGrid();
        this.selectCurrentDirectorFromScroll();
        this.setBackgroundVideo();
    }

    setBackgroundVideo() {
        const videoUrl = this.currentDirector.dataset.video!;
        const videoPoster = this.currentDirector.dataset.poster!;
        const srcToUse =
            this.app.store.homeVideoBlobs.get(videoUrl) || videoUrl;

        if (srcToUse === this.videoEl.src) return;

        this.lowPowerFallbackEl.src = videoPoster;
        this.videoEl.src = srcToUse;
        this.videoEl.poster = videoPoster;
        this.videoEl.load();

        if (!this.isLowPowerMode) {
            this.videoEl.play().catch((error) => {
                if (error.name === "NotAllowedError") {
                    this.enableLowPowerModeFallback();
                }
            });
        }
    }

    selectCurrentDirectorFromScroll() {
        if (this.isDesktop) {
            // Use the middle column (index 1) for center detection
            const wrappedY = this.columnWraps[1](this.y);
            const centerIndexInCol = Math.round(
                -(wrappedY - this.centerOffset) / this.ITEM_HEIGHT,
            );
            const directorEl = this.columnDirectors[1][centerIndexInCol];
            if (directorEl) {
                this.setCenterDirector(directorEl);
            }
        } else {
            const wrappedY = this.wrap(this.y);
            const centerIndex = Math.round(-wrappedY / this.ITEM_HEIGHT);
            this.setCenterDirectorByIndex(centerIndex);
        }
    }

    setCenterDirectorByIndex(index: number) {
        if (this.centerDirector) {
            this.centerDirector.dataset.center = "false";
        }
        this.centerIndex = index;
        this.centerDirector = this.directors[index];
        this.setCurrentDirectorByIndex(this.centerIndex);
        this.centerDirector.dataset.center = "true";
    }

    setCenterDirector(el: HTMLElement) {
        if (this.centerDirector) {
            this.centerDirector.dataset.center = "false";
        }
        this.centerDirector = el;
        this.centerIndex = parseInt(el.dataset.originalIndex || el.dataset.index!);
        this.centerDirector.dataset.center = "true";
        this.setCurrentDirector(el);
    }

    setCurrentDirectorByIndex(index: number) {
        if (this.currentDirector) {
            this.currentDirector.dataset.selected = "false";
        }

        this.currentIndex = index;
        this.currentDirector = this.directors[index];
        this.currentDirector.dataset.selected = "true";
    }

    setCurrentDirector(el: HTMLElement) {
        this.clearSelection();
        this.currentDirector = el;
        this.currentIndex = parseInt(el.dataset.originalIndex || el.dataset.index!);

        // Highlight all elements with the same director name across columns
        const name = el.dataset.director!;
        this.getAllDirectorElementsByName(name).forEach(
            (d) => (d.dataset.selected = "true"),
        );
    }

    clearSelection() {
        if (this.currentDirector) {
            if (this.isDesktop) {
                const name = this.currentDirector.dataset.director!;
                this.getAllDirectorElementsByName(name).forEach(
                    (d) => (d.dataset.selected = "false"),
                );
            } else {
                this.currentDirector.dataset.selected = "false";
            }
        }
    }

    getAllDirectorElementsByName(name: string): HTMLElement[] {
        if (this.isDesktop) {
            return this.allDesktopDirectors.filter(
                (d) => d.dataset.director === name,
            );
        }
        return this.directors.filter((d) => d.dataset.director === name);
    }

    snapToGrid() {
        const adjusted = this.y - this.centerOffset;
        const snapped =
            Math.round(adjusted / this.ITEM_HEIGHT) * this.ITEM_HEIGHT;
        const roundedY = snapped + this.centerOffset - this.ITEM_TOP_PADDING;

        if (Math.abs(this.y - roundedY) > 0.1) {
            this.y = roundedY;
            this.applyScroll(this.y);
        }
    }

    setInitialDirector() {
        let index = -1;

        if (this.app.store.homeLastDirectorIndex) {
            index = this.app.store.homeLastDirectorIndex;
        }

        if (this.isDesktop) {
            this.setInitialDirectorDesktop(index);
        } else {
            this.setInitialDirectorMobile(index);
        }
    }

    setInitialDirectorMobile(index: number) {
        if (index === -1) {
            const randomIndex = Math.floor(Math.random() * this.totalItems);
            index = randomIndex;
        }

        const initialOffset =
            -(index + this.totalItems) * this.ITEM_HEIGHT +
            this.centerOffset;

        this.y = this.wrap(initialOffset);
        gsap.set(this.list, { y: this.y });

        this.selectCurrentDirectorFromScroll();
    }

    setInitialDirectorDesktop(index: number) {
        // For desktop, use the middle column to determine initial position
        const col1Items = this.columnDirectors[1];
        const col1TotalUnique = col1Items.length / this.NUMBER_OF_DUPLICATES;

        let colIndex: number;
        if (index === -1) {
            colIndex = Math.floor(Math.random() * col1TotalUnique);
        } else {
            // Find the closest item in column 1 by original director index
            colIndex = 0;
            for (let i = 0; i < col1TotalUnique; i++) {
                if (parseInt(col1Items[i].dataset.originalIndex || "0") === index) {
                    colIndex = i;
                    break;
                }
            }
        }

        const initialOffset =
            -(colIndex + col1TotalUnique) * this.ITEM_HEIGHT +
            this.centerOffset;

        this.y = this.columnWraps[1](initialOffset);

        this.columnLists.forEach((colList) => {
            gsap.set(colList, { y: this.y });
        });

        this.selectCurrentDirectorFromScroll();
    }

    setupInfiniteScroll() {
        this.isDesktop = window.matchMedia("(min-width: 1024px)").matches;

        this.listWrapper = this.container.querySelector(
            "#directors-wrapper",
        ) as HTMLElement;

        this.preventHover = false;

        // persistent store between page swaps
        if (!this.app.store.homeVideoBlobs) {
            this.app.store.homeVideoBlobs = new Map();
        }

        if (this.isDesktop) {
            this.setupDesktopScroll();
        } else {
            this.setupMobileScroll();
        }

        this.observer = Observer.create({
            target: this.container,
            type: "wheel,touch,pointer",
            wheelSpeed: -0.25,
            onChangeY: (self: any) => {
                this.onScrollEvent(self);
            },
        });

        this.setupDirectorInteractions();
    }

    setupMobileScroll() {
        this.list = this.container.querySelector(
            "#directors-list",
        ) as HTMLElement;

        this.directors = Array.from(
            this.list.querySelectorAll(".director-item"),
        );
        this.totalItems = this.directors.length / this.NUMBER_OF_DUPLICATES;
        this.totalDirectors = this.totalItems;
        this.centerOffset = 0;

        this.collectVideosToLoad(this.directors);

        // Only when NUMBER_OF_DUPLICATES is 2
        this.wrap = gsap.utils.wrap(
            (-this.list.offsetHeight / 4) * 3,
            -this.list.offsetHeight / 4,
        );

        this.setInitialDirector();

        this.scrollTo = gsap.quickTo(this.list, "y", {
            ease: "power2",
            duration: 0.3,
            modifiers: {
                y: gsap.utils.unitize(this.wrap),
            },
        });
    }

    setupDesktopScroll() {
        this.columnLists = Array.from(
            this.container.querySelectorAll(".directors-column-list"),
        );

        this.columnDirectors = this.columnLists.map((colList) =>
            Array.from(colList.querySelectorAll(".director-item")),
        );

        this.allDesktopDirectors = this.columnDirectors.flat();
        this.directors = this.allDesktopDirectors;

        // Use the middle column's unique count for scroll calculations
        this.totalItems =
            this.columnDirectors[1].length / this.NUMBER_OF_DUPLICATES;

        // Total unique directors across all columns (for video preload distance)
        this.totalDirectors = this.columnDirectors.reduce(
            (sum, col) => sum + col.length / this.NUMBER_OF_DUPLICATES,
            0,
        );

        // Offset to vertically center the selected item in the wrapper
        this.centerOffset =
            this.listWrapper.offsetHeight / 2 - this.ITEM_HEIGHT / 2;

        this.collectVideosToLoad(this.allDesktopDirectors);

        this.columnWraps = this.columnLists.map((colList) =>
            gsap.utils.wrap(
                (-colList.offsetHeight / 4) * 3,
                -colList.offsetHeight / 4,
            ),
        );

        this.setInitialDirector();

        this.columnScrollTos = this.columnLists.map((colList, i) =>
            gsap.quickTo(colList, "y", {
                ease: "power2",
                duration: 0.3,
                modifiers: {
                    y: gsap.utils.unitize(this.columnWraps[i]),
                },
            }),
        );
    }

    collectVideosToLoad(directors: HTMLElement[]) {
        const allVideos = directors.map((dir) => ({
            video: dir.dataset.video!,
            index: parseInt(dir.dataset.originalIndex || dir.dataset.index!),
        }));

        this.videosToLoad = Array.from(
            new Set(allVideos.map((v) => v.video)),
        ).map((video) => {
            return allVideos.find((v) => v.video === video)!;
        });
    }

    setupDirectorInteractions() {
        const allDirectors = this.isDesktop
            ? this.allDesktopDirectors
            : this.directors;

        allDirectors.forEach((director) => {
            director.addEventListener(
                "click",
                () => {
                    this.onDirectorClick(director);
                },
                { signal: this.abortController.signal },
            );
            director.addEventListener(
                "mouseenter",
                () => {
                    this.onDirectorEnter(director);
                },
                { signal: this.abortController.signal },
            );
            director.addEventListener(
                "mouseleave",
                () => {
                    this.onDirectorLeave(director);
                },
                { signal: this.abortController.signal },
            );
        });
    }

    onDirectorClick(director: HTMLElement) {
        this.preventHover = true;
        if (this.isDesktop) {
            this.setCurrentDirector(director);
        } else {
            const index = parseInt(director.dataset.index!);
            this.setCurrentDirectorByIndex(index);
        }
        this.setBackgroundVideo();
    }

    onDirectorEnter(director: HTMLElement) {
        if (this.preventHover) return;
        if (director === this.currentDirector) return;
        if (this.isDesktop) {
            this.setCurrentDirector(director);
        } else {
            const index = parseInt(director.dataset.index!);
            if (index === this.currentIndex) return;
            this.setCurrentDirectorByIndex(index);
        }
        this.setBackgroundVideo();
    }

    onDirectorLeave(director: HTMLElement) {
        if (this.preventHover) return;
        if (this.isDesktop) {
            if (director.dataset.director === this.centerDirector?.dataset.director) return;
            this.setCurrentDirector(this.centerDirector);
        } else {
            const index = parseInt(director.dataset.index!);
            if (index === this.centerIndex) return;
            this.setCurrentDirectorByIndex(this.centerIndex);
        }
        this.setBackgroundVideo();
    }

    reveal() {
        gsap.from(this.listWrapper, {
            y: 100,
            duration: 1.2,
            delay: 0.5,
            ease: "power2.out",
        });
    }

    get allLists(): HTMLElement[] {
        if (this.isDesktop) return this.columnLists;
        return [this.list];
    }

    transitionOut({
        sourceElement,
        to,
    }: {
        sourceElement: HTMLElement;
        to: string;
    }): Promise<any> | gsap.core.Timeline {
        // save current director index to restore it when coming back
        this.app.store.homeLastDirectorIndex = this.currentIndex;

        this.swapTl = gsap.timeline({ paused: true });

        if (to === "work" || to === "director") {
            this.swapTl.to(this.allLists, {
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
            this.swapTl.to(this.allLists, {
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
        this.swapTl.to(
            this.listWrapper,
            {
                y: 0,
                duration: 1.2,
                ease: "power2.out",
            },
            "<",
        );

        this.updateHeaderItems();

        return this.swapTl.play();
    }

    prepareTransitionIn() {
        const listWrapper = this.container.querySelector(
            "#directors-wrapper",
        ) as HTMLElement;
        if (this.previousPage?.template === "director") {
            const lists = this.container.querySelectorAll(
                "#directors-list, .directors-column-list",
            );
            gsap.set(lists, { opacity: 0 });
        } else {
            gsap.set(this.container, { opacity: 0 });
        }
        gsap.set(listWrapper, { y: 100 });
    }
}
