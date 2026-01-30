import DebugGrid from "./DebugGrid";
import Loader from "./Loader";
import SwapManager from "./SwapManager";
import Scroll from "./Scroll";

import { getPage } from "./pages";

import type Page from "./pages/Page";

export default class Zauberberg {
    private static instance: Zauberberg;
    swapManager!: SwapManager;
    initialized!: boolean;
    loader!: Loader;
    scroll!: Scroll;
    page!: null | Page;
    debugGrid!: DebugGrid;

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.initialized = false;

        this.scroll = new Scroll();
        this.swapManager = new SwapManager();
        this.loader = new Loader();
        this.debugGrid = new DebugGrid();

        const initialTemplate =
            document.querySelector<HTMLElement>("#page")!.dataset.template ||
            "";

        const currentPage = getPage(initialTemplate);
        this.setCurrentPage(currentPage!);
    }

    setCurrentPage(page: Page) {
        this.page = page;
    }

    async init() {
        this.loader.start();

        this.scroll.init();
        this.swapManager.init();
        this.page?.init();
        this.debugGrid.init();
        this.initialized = true;

        this.loader.end();
    }
}
