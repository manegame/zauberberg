import SwapManager from "./SwapManager";

export default class Zauberberg {
    private static instance: Zauberberg;
    public swapManager!: SwapManager;

    constructor() {
        if (Zauberberg.instance) return Zauberberg.instance;
        Zauberberg.instance = this;

        this.swapManager = new SwapManager();
        this.init();
    }

    init() {
        this.swapManager.init();
    }
}
