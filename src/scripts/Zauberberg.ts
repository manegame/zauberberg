import DebugGrid from "./DebugGrid";
import Loader from "./Loader";
import SwapManager from "./SwapManager";
import Scroll from "./Scroll";
import DirectorsPage from "./pages/Directors";

import getPageClass from "./pages";
import type Page from "./pages/Page";

export default class Zauberberg {
    private static instance: Zauberberg;
    swapManager!: SwapManager;
    initialized!: boolean;
    loader!: Loader;
    scroll!: Scroll;
    directorsPage!: DirectorsPage;
    page!: null | Page;
    debugGrid!: DebugGrid;

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.initialized = false;

        this.scroll = new Scroll();
        this.directorsPage = new DirectorsPage();
        this.swapManager = new SwapManager();
        this.loader = new Loader();
        this.debugGrid = new DebugGrid();

        const initialTemplate =
            document.querySelector<HTMLElement>("#page")!.dataset.template;

        this.page = this.getPage(initialTemplate);
    }

    getPage(template: string | undefined) {
        const PageClass = getPageClass(template);
        if (PageClass) {
            return new PageClass();
        }
        return null;
    }

    switchPage() {
        const newTemplate =
            document.querySelector<HTMLElement>("#page")!.dataset.template;

        if (this.page) {
            this.page.destroy();
        }

        this.page = this.getPage(newTemplate);
        this.page?.init();
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
