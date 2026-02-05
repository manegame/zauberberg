import Page from "./Page";
import gsap from "gsap";

import { navigate } from "astro:transitions/client";

export default class Director extends Page {
    banner!: HTMLElement;
    overlay!: HTMLElement;
    wrapper!: HTMLElement;
    abortController!: AbortController;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.wrapper = this.container.querySelector("#director")!;
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
        navigate(this.previousUrl);
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

        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(overlay, {
            opacity: 0.85,
            duration: 0.4,
            ease: "power3.out",
        });
        this.swapTl.to(
            banner,
            { yPercent: 0, duration: 0.4, ease: "power3.out" },
            "<",
        );

        if (this.previousPage?.template === "video") {
            const navigationItems = document.querySelectorAll(
                "#navigation .navigation-item",
            );
            this.swapTl.to(
                navigationItems,
                {
                    yPercent: 0,
                    stagger: 0.05,
                    duration: 0.4,
                    ease: "power3.inOut",
                },
                "<",
            );
        }

        return this.swapTl.play();
    }

    transitionOut({ to }: { to: string }) {
        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.overlay, {
            opacity: 1,
            duration: 0.2,
            ease: "power3.out",
        });
        this.swapTl.to(
            this.banner,
            { yPercent: -100, duration: 0.2, ease: "power3.out" },
            "<",
        );

        if (to === "video") {
            const navigationItems = document.querySelectorAll(
                "#navigation .navigation-item",
            );
            this.swapTl.to(
                navigationItems,
                {
                    yPercent: -100,
                    stagger: 0.02,
                    duration: 0.2,
                    ease: "power3.inOut",
                },
                "<",
            );
        }

        return this.swapTl.play();
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
