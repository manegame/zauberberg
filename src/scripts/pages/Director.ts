import Page from "./Page";
import { navigate } from "astro:transitions/client";

export default class Director extends Page {
    banner!: HTMLElement;
    abortController!: AbortController;

    constructor() {
        super();

        this.container = document.querySelector("#director") as HTMLElement;
    }

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.banner = document.querySelector("#director-banner") as HTMLElement;
        this.abortController = new AbortController();

        if (this.banner) {
            this.setupMobileTabs();
            this.setupClose();
        }

        await super.init();
    }

    setupClose() {
        const closeBtn = this.banner.querySelector(
            "#director-close-btn",
        ) as HTMLButtonElement;

        const overlay = document.querySelector(
            "#director-overlay",
        ) as HTMLDivElement;

        overlay.addEventListener(
            "click",
            () => {
                this.close();
            },
            { signal: this.abortController.signal },
        );

        closeBtn.addEventListener(
            "click",
            () => {
                this.close();
            },
            { signal: this.abortController.signal },
        );
    }

    close() {
        const backLink = this.container.dataset.back || "/";
        navigate(backLink);
    }

    setupMobileTabs() {
        const workBtn = this.banner.querySelector(
            "#director-work-btn",
        ) as HTMLButtonElement;
        const bioBtn = this.banner.querySelector(
            "#director-bio-btn",
        ) as HTMLButtonElement;

        workBtn.addEventListener(
            "click",
            () => {
                this.banner!.dataset.selected = "work";
            },
            { signal: this.abortController.signal },
        );

        bioBtn.addEventListener(
            "click",
            () => {
                this.banner!.dataset.selected = "bio";
            },
            { signal: this.abortController.signal },
        );
    }
}
