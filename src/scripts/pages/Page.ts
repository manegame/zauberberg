import gsap from "gsap";
import Zauberberg from "../Zauberberg";

export default class Page {
    container!: HTMLElement;
    initialized: boolean;
    destroyed: boolean;
    app: Zauberberg;
    template: string;

    constructor(template: string, doc: Document = window.document) {
        this.app = new Zauberberg();
        this.template = template;
        this.container = doc.getElementById("page") as HTMLElement;
        this.initialized = false;
        this.destroyed = false;
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
        const tl = gsap.timeline({ paused: true });

        tl.to(this.container, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
        });

        return tl.play();
    }

    transitionOut(to: Page): Promise<any> | gsap.core.Timeline {
        const tl = gsap.timeline({ paused: true });

        tl.to(this.container, {
            opacity: 0,
            duration: 0,
            ease: "power2.out",
        });

        return tl.play();
    }
}
