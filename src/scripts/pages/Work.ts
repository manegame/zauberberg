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

        if (!this.isMobile) this.setupInitialScroll();

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

        this.app.scroll.lenis.scrollTo(initialScroll, {
            duration: 0,
            immediate: true,
        });
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
