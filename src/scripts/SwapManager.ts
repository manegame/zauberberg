import { gsap } from "gsap";

import Zauberberg from "./Zauberberg";

export default class SwapManager {
    app: Zauberberg;
    transitionTimeline: gsap.core.Timeline;

    constructor() {
        this.app = new Zauberberg();
        this.transitionTimeline = gsap.timeline({ paused: true });
    }

    init() {
        // document.addEventListener("astro:before-swap", (event) => {
        //     event.swap = () =>
        //         this.getSwapTransition(event.from, event.to)(
        //             event.newDocument,
        //             this.transitionTimeline,
        //         );
        // });
    }

    // getSwapTransition(from: URL, to: URL) {
    //     const swapTransition =
    //         (SWAPS_TRANSITIONS as any)[from.pathname]?.[to.pathname] ||
    //         DEFAULT_SWAP_TRANSITION;

    //     return swapTransition;
    // }
}
