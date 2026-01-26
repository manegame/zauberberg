import Page from "./Page";

import { gsap } from "gsap";

// @ts-ignore
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export default class DirectorsPage extends Page {
    y!: number;
    list!: HTMLElement;
    ghostList!: HTMLElement;
    scrollTo!: any;
    ghostScrollTo!: any;
    wrap!: (index: number) => number;
    scrollEndTimeout?: number;
    DELTA_MULTIPLIER: number;
    ITEM_HEIGHT: number;
    observer!: Observer;

    constructor() {
        super();
        this.DELTA_MULTIPLIER = 1;
        this.ITEM_HEIGHT = 26;
        this.container = document.querySelector(
            "#directors-page",
        ) as HTMLElement;
    }

    init() {
        if (!this.container) return;

        this.setupInfiniteScroll();
        this.initalized = true;
    }

    onScrollEvent(scroll: any) {
        const deltaY = scroll.deltaY;

        this.y += deltaY * this.DELTA_MULTIPLIER;

        this.scrollTo(this.y);
        this.ghostScrollTo(this.y);

        if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
        }

        this.scrollEndTimeout = setTimeout(() => {
            this.snapToGrid();
        }, 800) as any;
    }

    snapToGrid() {
        const roundedY =
            Math.round(this.y / this.ITEM_HEIGHT) * this.ITEM_HEIGHT;

        if (Math.abs(this.y - roundedY) > 0.1) {
            this.y = roundedY;
            this.scrollTo(this.y);
            this.ghostScrollTo(this.y);
            console.log("snapping", this.y);
        }
    }

    setupInfiniteScroll() {
        this.list = this.container.querySelector(
            "#directors-list",
        ) as HTMLElement;
        this.ghostList = this.container.querySelector(
            "#directors-ghost-list",
        ) as HTMLElement;

        this.wrap = gsap.utils.wrap(
            (-this.list.offsetHeight / 4) * 3,
            -this.list.offsetHeight / 4,
        );

        this.y = this.container.dataset.initial
            ? parseInt(this.container.dataset.initial, 10)
            : 0;

        this.scrollTo = gsap.quickTo(this.list, "y", {
            ease: "power3",
            duration: 1.2,
            modifiers: {
                y: gsap.utils.unitize(this.wrap),
            },
        });

        this.ghostScrollTo = gsap.quickTo(this.ghostList, "y", {
            ease: "power3",
            duration: 1.2,
            modifiers: {
                y: gsap.utils.unitize(this.wrap),
            },
        });

        this.observer = Observer.create({
            target: this.container,
            type: "wheel,touch,pointer",
            wheelSpeed: -0.25,
            onChangeY: (self) => {
                this.onScrollEvent(self);
            },
        });
    }
}
