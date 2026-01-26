import type { TransitionBeforeSwapEvent } from "astro/virtual-modules/transitions-events.js";
import Zauberberg from "./Zauberberg";

import { SWAPS_TRANSITIONS, DEFAULT_SWAP_TRANSITION } from "./swaps";
import DefaultSwap from "./swaps/DefaultSwap";

export default class SwapManager {
    app: Zauberberg;
    currentSwap: DefaultSwap | null;

    constructor() {
        this.app = new Zauberberg();
        this.currentSwap = null;
    }

    onAfterSwapEvent() {
        this.app.switchPage();
    }

    onBeforeSwapEvent(event: any) {
        const swap = this.getSwap(event);

        if (this.currentSwap) this.currentSwap.kill();

        this.currentSwap = swap;

        event.swap = () => swap.execute(event.newDocument);
    }

    init() {
        document.addEventListener(
            "astro:before-swap",
            (event: TransitionBeforeSwapEvent) => {
                this.onBeforeSwapEvent(event);
            },
        );
    }

    getSwap(event: TransitionBeforeSwapEvent) {
        const { from, to, newDocument } = event;

        const Swap =
            (SWAPS_TRANSITIONS as any)[from.pathname]?.[to.pathname] ||
            DEFAULT_SWAP_TRANSITION;

        const swapToUse = new Swap(newDocument, this);

        return swapToUse;
    }
}
