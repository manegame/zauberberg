import Page from "./Page";
import gsap from "gsap";

export default class Work extends Page {
    abortController!: AbortController;
    wrapper!: HTMLElement | null;
    items!: NodeListOf<HTMLElement>;
    initialScroll!: number;
    centerVideo!: HTMLElement | null;
    isMobile!: boolean;
    shouldLoadVideosOnInit!: boolean;

    constructor(...args: ConstructorParameters<typeof Page>) {
        super(...args);
        this.shouldLoadVideosOnInit = true;
    }

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.wrapper = this.container.querySelector("#work-wrapper");
        this.items = this.container?.querySelectorAll(".video-item");
        this.abortController = new AbortController();

        this.isMobile = window.innerWidth < 1024;

        if (!this.isMobile) this.setupInitialScroll();

        if (this.shouldLoadVideosOnInit) this.loadVideos();

        await super.init();
    }

    setupInitialScroll() {
        if (!this.centerVideo) {
            this.centerVideo = this.getVideoOnCenter(this.items);
        }
        if (!this.initialScroll) {
            this.initialScroll = this.getInitialScroll();
        }

        if (this.initialScroll && this.wrapper) {
            this.wrapper.style.scrollBehavior = "auto";
            this.wrapper.scrollTop = this.initialScroll;
            this.wrapper.style.scrollBehavior = "";
        }
    }

    getVideoOnCenter(items: NodeListOf<HTMLElement>) {
        const dataCenter =
            this.container
                ?.querySelector("#work")
                ?.getAttribute("data-center") || "0";

        return Array.from(items)[parseInt(dataCenter)];
    }

    getInitialScroll() {
        if (!this.centerVideo) return 0;

        const initialScroll =
            this.centerVideo.offsetTop +
            this.centerVideo.offsetHeight / 2 -
            window.innerHeight / 2;

        return initialScroll;
    }

    loadVideos() {
        const videos = this.container?.querySelectorAll(".work-video");
        videos?.forEach((video) => {
            const src = video.getAttribute("data-src");
            if (src) video.setAttribute("src", src);
        });
    }

    prepareTransitionIn(sourceElement?: HTMLElement): void {
        if (
            this.previousPage?.template !== "directors_page" ||
            window.innerWidth < 1024
        ) {
            gsap.set(this.container, { opacity: 0 });
        } else {
            this.shouldLoadVideosOnInit = false;
        }
    }

    transitionIn() {
        this.initialScroll = this.getInitialScroll();
        this.swapTl = gsap.timeline({
            paused: true,
        });

        if (
            this.previousPage?.template === "directors_page" &&
            window.innerWidth >= 1024
        ) {
            this.swapTl.eventCallback("onComplete", () => {
                this.loadVideos();
            });

            const grid = this.container?.querySelector("#work-wrapper");
            const items = this.container?.querySelectorAll(".video-item");

            const scale = window.innerHeight / this.centerVideo!.offsetHeight;

            gsap.set(grid, {
                scale: scale,
            });

            gsap.set(items, {
                pointerEvents: "none",
            });

            this.swapTl
                .to(grid, {
                    scale: 1,
                    duration: 1.2,
                    ease: "power3.inOut",
                })
                .set(items, { pointerEvents: "auto" });
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

    resize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 1024;

        if (wasMobile !== this.isMobile) {
            if (!this.isMobile) {
                this.setupInitialScroll();
            } else {
                this.app.scroll.reset();
            }
        }
    }
}
