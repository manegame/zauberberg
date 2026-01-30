import gsap from "gsap";
import Zauberberg from "../Zauberberg";

export default class Page {
    container!: HTMLElement;
    initialized: boolean;
    destroyed: boolean;
    app: Zauberberg;
    template: string;

    swapTl: gsap.core.Timeline | null;

    constructor(template: string, doc: Document = window.document) {
        this.app = new Zauberberg();
        this.template = template;
        this.container = doc.getElementById("page") as HTMLElement;
        this.swapTl = null;
        this.initialized = false;
        this.destroyed = false;
    }

    killCurrentSwap() {
        if (this.swapTl) {
            console.log("killing tl");

            this.swapTl.kill();
            this.swapTl = null;
        }
    }

    async init() {
        this.initialized = true;
    }

    destroy() {
        this.destroyed = true;
    }

    prepareTransitionIn(from: Page) {
        gsap.set(this.container, { opacity: 0 });
    }

    transitionIn(from: Page): Promise<any> | gsap.core.Timeline {
        this.killCurrentSwap();

        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
        });

        return this.swapTl.play();
    }

    transitionOut(to: Page): Promise<any> | gsap.core.Timeline {
        this.killCurrentSwap();
        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 0,
            duration: 0,
            ease: "power2.out",
        });

        return this.swapTl.play();
    }
}
