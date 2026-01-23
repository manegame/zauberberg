import Loader from "./Loader";
import SwapManager from "./SwapManager";
import Scroll from "./Scroll";
import DirectorsPage from "./pages/Directors";

export default class Zauberberg {
    private static instance: Zauberberg;
    public swapManager!: SwapManager;
    initialized!: boolean;
    loader!: Loader;
    scroll!: Scroll;
    directorsPage!: DirectorsPage;

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.initialized = false;

        this.scroll = new Scroll();
        this.directorsPage = new DirectorsPage();
        this.swapManager = new SwapManager();
        this.loader = new Loader();
    }

    async init() {
        this.loader.start();

        this.scroll.init();
        this.swapManager.init();
        this.directorsPage.init();
        this.initialized = true;

        this.loader.end();
    }
}
