import { swapFunctions } from "astro:transitions/client";
import { getPage } from "./pages";

import type Page from "./pages/Page";
import type SwapManager from "./SwapManager";

export default class Swap {
    restoreFocusFunction!: () => void;
    killed: boolean;

    page!: Page;
    doc!: Document;

    newPage!: Page;
    newDoc!: Document;

    manager: SwapManager;

    constructor(newDoc: Document, manager: SwapManager) {
        this.manager = manager;

        this.killed = false;

        this.newDoc = newDoc;
        this.doc = document;

        this.page = this.manager.page;

        const newTemplate =
            this.newDoc.querySelector<HTMLElement>("#page")!.dataset.template ||
            "";

        this.newPage = getPage(newTemplate, this.newDoc)!;
    }

    kill() {
        this.killed = true;
        console.log("[SWAP] - swap killing");

        this.page.killCurrentSwap();
        this.newPage.killCurrentSwap();
    }

    async execute() {
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

    transfertStates() {
        const loaderEl = this.newDoc.getElementById("loader");
        if (loaderEl) loaderEl.setAttribute("data-finished", "true");
    }

    beforeOut() {
        console.log("[SWAP] - before out");

        this.transfertStates();

        swapFunctions.deselectScripts(this.newDoc);
        swapFunctions.swapRootAttributes(this.newDoc);
        swapFunctions.swapHeadElements(this.newDoc);
        this.restoreFocusFunction = swapFunctions.saveFocus();
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
        this.manager.setCurrentPage(this.newPage);
    }
}
