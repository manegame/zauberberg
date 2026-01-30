import type { TransitionBeforeSwapEvent } from "astro/virtual-modules/transitions-events.js";
import Zauberberg from "./Zauberberg";
import Swap from "./Swap";
import type Page from "./pages/Page";

export default class SwapManager {
    app: Zauberberg;
    currentSwap: null | Swap;
    page!: Page;

    constructor() {
        this.app = new Zauberberg();
        this.currentSwap = null;
    }

    onBeforeSwapEvent(event: TransitionBeforeSwapEvent) {
        console.log("[SWAP MANAGER] - New swap requested");

        const swap = new Swap(event.newDocument, this);
        if (this.currentSwap) this.currentSwap.kill();
        this.currentSwap = swap;
        event.swap = () => swap.execute();
    }

    init() {
        this.page = this.app.page!;
        document.addEventListener(
            "astro:before-swap",
            (event: TransitionBeforeSwapEvent) => {
                this.onBeforeSwapEvent(event);
            },
        );

        document.addEventListener("astro:after-swap", () => {
            this.app.scroll.reset();
        });
    }

    setCurrentPage(page: Page) {
        this.page = page;
        this.app.setCurrentPage(page);
    }
}
