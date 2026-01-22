import SwapManager from "./SwapManager";

export default class Zauberberg {
    private static instance: Zauberberg;
    public swapManager!: SwapManager;
    initialized!: boolean;

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.initialized = false;

        this.swapManager = new SwapManager();
    }

    init() {
        this.swapManager.init();
        this.initialized = true;
    }
}
