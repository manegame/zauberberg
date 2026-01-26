import Zauberberg from "../Zauberberg";

export default class Page {
    container!: HTMLElement;
    initialized: boolean;
    destroyed: boolean;
    app: Zauberberg;

    constructor() {
        this.app = new Zauberberg();
        this.initialized = false;
        this.destroyed = false;
    }

    init() {
        this.initialized = true;
    }

    destroy() {
        this.destroyed = true;
    }
}
