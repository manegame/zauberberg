import Page from "./Page";
import gsap from "gsap";

export default class Work extends Page {
    abortController!: AbortController;
    items: HTMLElement[] = [];
    isMobile!: boolean;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.abortController = new AbortController();

        this.isMobile = window.innerWidth < 1024;

        if (!this.isMobile && !this.previousPage) this.setupInitialScroll();

        await super.init();
    }

    setupInitialScroll() {
        this.items = Array.from(
            this.container?.querySelectorAll(".video-item") || [],
        );

        const dataCenter =
            this.container
                ?.querySelector("#work")
                ?.getAttribute("data-center") || "0";

        const videoOnCenterLine = this.items[parseInt(dataCenter)];

        if (!videoOnCenterLine) return;

        const initialScroll =
            videoOnCenterLine.offsetTop +
            videoOnCenterLine.offsetHeight / 2 -
            window.innerHeight / 2;

        window.scrollTo(0, initialScroll);
    }

    transitionIn() {
        this.swapTl = gsap.timeline({ paused: true });

        if (!this.isMobile) this.setupInitialScroll();

        this.swapTl.to(this.container, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
        });

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
