import Page from "./Page";
import gsap from "gsap";

// @ts-ignore
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);

export default class NewsSingle extends Page {
    previousThumbnailState!: Flip.FlipState | null;
    previousDetailsState!: Flip.FlipState | null;

    async init() {
        if (!this.container) return;

        await super.init();
    }

    transitionIn(): Promise<any> | gsap.core.Timeline {
        this.swapTl = gsap.timeline({ paused: true });

        const duration = 0.6;

        if (this.previousPage?.template === "news_home") {
            const sections =
                this.container.querySelectorAll(".sections-wrapper");
            this.swapTl.to(sections, {
                opacity: 1,
                duration: duration,
                ease: "power2.inOut",
            });

            if (this.previousThumbnailState) {
                this.swapTl.add(
                    Flip.from(this.previousThumbnailState, {
                        targets:
                            this.container.querySelector("[data-image-id]"),
                        duration: duration,
                        absolute: true,
                        ease: "power2.inOut",
                    }),
                    "<",
                );
            }
            if (this.previousDetailsState) {
                this.swapTl.add(
                    Flip.from(this.previousDetailsState, {
                        targets:
                            this.container.querySelector("[data-details-id]"),
                        duration: duration,
                        ease: "power2.inOut",
                    }),
                    "<",
                );
            }
        } else {
            this.swapTl.to(this.container, {
                opacity: 1,
                duration: duration,
                ease: "power2.out",
            });
        }
        return this.swapTl.play();
    }

    prepareTransitionIn(): void {
        const sections = this.container.querySelectorAll(".sections-wrapper");

        if (this.previousPage?.template === "news_home") {
            const currentThumbnail =
                this.container.querySelector("[data-image-id]");
            const currentDetails =
                this.container.querySelector("[data-details-id]");

            const thumbnailId = currentThumbnail?.getAttribute("data-image-id");
            const detailsId = currentDetails?.getAttribute("data-details-id");

            const previousThumbnail = this.previousPage.container.querySelector(
                `[data-image-id="${thumbnailId}"]`,
            );
            const previousDetails = this.previousPage.container.querySelector(
                `[data-details-id="${detailsId}"]`,
            );

            this.previousThumbnailState = Flip.getState(previousThumbnail);
            this.previousDetailsState = Flip.getState(previousDetails);

            gsap.set(sections, { opacity: 0 });
        } else {
            gsap.set(this.container, { opacity: 0 });
        }
    }
}
