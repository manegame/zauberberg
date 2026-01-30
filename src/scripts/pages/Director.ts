import Page from "./Page";
import gsap from "gsap";

import { navigate } from "astro:transitions/client";

export default class Director extends Page {
    banner!: HTMLElement;
    overlay!: HTMLElement;
    abortController!: AbortController;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.banner = this.container.querySelector("#director-banner")!;
        this.overlay = this.container.querySelector("#director-overlay")!;

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

    transitionIn() {
        const overlay = this.container.querySelector(
            "#director-overlay",
        ) as HTMLDivElement;

        const banner = this.container.querySelector(
            "#director-banner",
        ) as HTMLElement;

        const tl = gsap.timeline({ paused: true });

        tl.to(overlay, {
            opacity: 0.85,
            duration: 0.4,
            ease: "power3.out",
        });
        tl.to(banner, { yPercent: 0, duration: 0.4, ease: "power3.out" }, "<");

        return tl.play();
    }

    transitionOut() {
        const tl = gsap.timeline({ paused: true });

        tl.to(this.overlay, {
            opacity: 1,
            duration: 0.2,
            ease: "power3.out",
        });
        tl.to(
            this.banner,
            { yPercent: -100, duration: 0.2, ease: "power3.out" },
            "<",
        );

        return tl.play();
    }

    prepareTransitionIn() {
        const overlay = this.container.querySelector(
            "#director-overlay",
        ) as HTMLDivElement;

        const banner = this.container.querySelector(
            "#director-banner",
        ) as HTMLElement;

        gsap.set(overlay, { opacity: 1 });
        gsap.set(banner, { yPercent: -100 });
    }
}
