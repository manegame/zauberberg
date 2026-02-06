import Page from "./Page";
import gsap from "gsap";

export default class Basic extends Page {
    abortController!: AbortController;
    subnavigation!: HTMLElement | null;
    ghostSubnavigation!: HTMLElement | null;
    content!: HTMLElement;
    prevHasSameSubnav: boolean = false;

    destroy() {
        this.abortController.abort();
        super.destroy();
    }

    async init() {
        if (!this.container) return;

        this.subnavigation = this.container.querySelector("#subnavigation");
        this.ghostSubnavigation = this.container.querySelector(
            "#ghost-subnavigation",
        );
        this.abortController = new AbortController();
        // this.setupNavActive();

        await super.init();
    }

    setupNavActive() {
        if (!this.subnavigation || !this.ghostSubnavigation) return;
        const currentLink = this.subnavigation.querySelector(
            ".link-current",
        ) as HTMLElement;

        if (currentLink) {
            const offset = currentLink.offsetTop;

            gsap.set([this.subnavigation, this.ghostSubnavigation], {
                y: -offset,
            });
        }
    }

    transitionIn() {
        this.swapTl = gsap.timeline({ paused: true });

        if (this.prevHasSameSubnav) {
            this.swapTl.to(this.content, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        } else {
            this.swapTl.to(this.container, {
                opacity: 1,
                duration: 0.2,
                ease: "power2.out",
            });
        }

        return this.swapTl.play();
    }

    prepareTransitionIn() {
        this.prevHasSameSubnav =
            (this.previousPage as Basic)?.subnavigation?.getAttribute(
                "data-subnav-id",
            ) === this.subnavigation?.getAttribute("data-subnav-id");

        this.content = this.container.querySelector("#basic-content")!;

        if (this.prevHasSameSubnav) {
            gsap.set(this.content, { opacity: 0 });
        } else {
            gsap.set(this.container, { opacity: 0 });
        }
    }

    transitionOut({
        sourceElement,
        to,
    }: {
        sourceElement: HTMLElement;
        to?: string;
    }) {
        this.swapTl = gsap.timeline({ paused: true });

        const toIsInSubnav = sourceElement.closest("#subnavigation");

        if (to === "basic" && toIsInSubnav) {
            this.swapTl.to([this.subnavigation, this.ghostSubnavigation], {
                y: -sourceElement.offsetTop,
                duration: 0.6,
                ease: "power3.out",
            });

            this.swapTl.to(
                this.content,
                {
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                },
                "<",
            );
        } else {
            this.swapTl.to(this.container, {
                opacity: 0,
                duration: 0.2,
                ease: "power2.out",
            });
        }

        return this.swapTl.play();
    }
}
