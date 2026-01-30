import type { TransitionBeforeSwapEvent } from "astro/virtual-modules/transitions-events.js";
import { swapFunctions } from "astro:transitions/client";
import Zauberberg from "./Zauberberg";

import { getPage } from "./pages";

import type Page from "./pages/Page";

export default class SwapManager {
    app: Zauberberg;
    restoreFocusFunction!: () => void;

    page!: Page;
    doc!: Document;

    newPage!: Page;
    newDoc!: Document;

    constructor() {
        this.app = new Zauberberg();
    }

    transfertStates() {
        const loaderEl = this.newDoc.getElementById("loader");
        if (loaderEl) loaderEl.setAttribute("data-finished", "true");
    }

    async execute(newDocument: Document) {
        this.doc = document;
        this.newDoc = newDocument;

        const newTemplate =
            this.newDoc.querySelector<HTMLElement>("#page")!.dataset.template ||
            "";

        this.page = this.app.page!;
        this.newPage = getPage(newTemplate, this.newDoc);

        console.log(
            `executing swap: from ${this.page.template} to ${this.newPage.template}`,
        );

        this.beforeOut();
        await this.page.transitionOut(this.page);
        this.afterOut();

        this.beforeIn();
        await this.newPage.transitionIn(this.newPage);
        this.afterIn();
    }

    beforeOut() {
        console.log("[SWAP] - before out");

        this.transfertStates();

        swapFunctions.deselectScripts(this.newDoc);
        console.log("1");

        swapFunctions.swapRootAttributes(this.newDoc);
        console.log("2");

        swapFunctions.swapHeadElements(this.newDoc);
        console.log("3");

        this.restoreFocusFunction = swapFunctions.saveFocus();
        console.log("4");
    }

    afterOut() {
        console.log("[SWAP] - after out");
        this.page?.destroy();
    }

    beforeIn() {
        console.log("[SWAP] - before in");

        if (this.newPage.prepareTransitionIn) {
            this.newPage.prepareTransitionIn(this.page);
        }

        swapFunctions.swapBodyElement(this.newDoc.body, this.doc.body);
        this.restoreFocusFunction();
        this.newPage.init();
    }

    afterIn() {
        console.log("[SWAP] - after in");
        this.app.setCurrentPage(this.newPage);
    }

    init() {
        document.addEventListener(
            "astro:before-swap",
            (event: TransitionBeforeSwapEvent) => {
                event.swap = () => this.execute(event.newDocument);
            },
        );
    }
}
