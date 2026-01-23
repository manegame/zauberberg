import Zauberberg from "../Zauberberg";

export default class Page {
    container!: HTMLElement;
    initalized: boolean;
    app: Zauberberg;

    constructor() {
        this.app = new Zauberberg();
        this.initalized = false;
    }
}
