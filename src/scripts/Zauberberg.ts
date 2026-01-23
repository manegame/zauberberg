import Loader from "./Loader";
import SwapManager from "./SwapManager";

export default class Zauberberg {
    private static instance: Zauberberg;
    public swapManager!: SwapManager;
    initialized!: boolean;
    loader!: Loader;

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.initialized = false;

        this.swapManager = new SwapManager();
        this.loader = new Loader();
    }

    async init() {
        this.loader.start();

        this.swapManager.init();
        this.initialized = true;

        this.loader.end();
    }
}
