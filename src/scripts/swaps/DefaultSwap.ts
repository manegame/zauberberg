import { swapFunctions } from "astro:transitions/client";
import type SwapManager from "../SwapManager";

import { gsap } from "gsap";

export default class DefaultSwap {
    doc: Document;
    manager: SwapManager;
    tl: gsap.core.Timeline;
    restoreFocusFunction!: () => void;
    killed: boolean;

    constructor(doc: Document, manager: SwapManager) {
        this.doc = doc;
        this.manager = manager;
        this.tl = gsap.timeline({ paused: true });
        this.killed = false;
    }

    async execute() {
        console.log("executing swap: ", this.constructor.name);
        this.beforeTransition();
        await this.transition();
        this.afterTransition();
    }

    async transition(): Promise<any> {
        return Promise.resolve();
    }

    beforeTransition() {
        console.log("before transi: ", this.constructor.name);

        const loaderEl = this.doc.getElementById("loader");
        if (loaderEl) loaderEl.setAttribute("data-finished", "true");

        swapFunctions.deselectScripts(this.doc);
        swapFunctions.swapRootAttributes(this.doc);
        swapFunctions.swapHeadElements(this.doc);
        this.restoreFocusFunction = swapFunctions.saveFocus();
    }

    afterTransition() {
        console.log("after transi: ", this.constructor.name);
        swapFunctions.swapBodyElement(this.doc.body, document.body);
        this.restoreFocusFunction();
    }

    kill() {
        this.killed = true;
        this.tl.kill();
        this.manager.currentSwap = null;
    }
}
