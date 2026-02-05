import Page from "./Page";
import gsap from "gsap";

// @ts-ignore
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);

export default class NewsHome extends Page {
    async init() {
        if (!this.container) return;
        await super.init();
    }

    transitionOut({
        to,
        sourceElement,
    }: {
        to?: string;
        sourceElement: HTMLElement;
    }) {
        this.swapTl = gsap.timeline({ paused: true });

        if (to === "news_single") {
            const otherNewsItems = Array.from(
                this.container.querySelectorAll(".news-item"),
            ).filter((item) => !item.contains(sourceElement));

            const filters = this.container.querySelectorAll("#filters-panel");

            this.swapTl.to(otherNewsItems, {
                opacity: 0,
                duration: 0.2,
                ease: "power2.out",
            });
            this.swapTl.to(
                filters,
                {
                    opacity: 0,
                    x: -20,
                    duration: 0.2,
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
