import gsap from "gsap";
import Zauberberg from "../Zauberberg";

export default class Page {
    container!: HTMLElement;
    initialized: boolean;
    destroyed: boolean;
    app: Zauberberg;
    template: string;
    previousUrl: string;
    previousPage?: Page;

    swapTl: gsap.core.Timeline | null;

    constructor(
        template: string,
        doc: Document = window.document,
        previousUrl: string = "/",
        previousPage?: Page,
    ) {
        this.app = new Zauberberg();
        this.template = template;
        this.container = doc.getElementById("page") as HTMLElement;
        this.swapTl = null;
        this.initialized = false;
        this.destroyed = false;
        this.previousUrl = previousUrl;
        this.previousPage = previousPage;
    }

    async init() {
        this.initialized = true;
    }

    destroy() {
        this.destroyed = true;
    }

    beforeTransitionOut(): Promise<any> | gsap.core.Timeline {
        return Promise.resolve();
    }

    prepareTransitionIn() {
        gsap.set(this.container, { opacity: 0 });
    }

    transitionIn(): Promise<any> | gsap.core.Timeline {
        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
        });

        return this.swapTl.play();
    }

    transitionOut({
        sourceElement,
        to,
    }: {
        sourceElement: HTMLElement;
        to: string;
    }): Promise<any> | gsap.core.Timeline {
        this.swapTl = gsap.timeline({ paused: true });

        this.swapTl.to(this.container, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
        });

        return this.swapTl.play();
    }
}
