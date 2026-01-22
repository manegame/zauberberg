import { gsap } from "gsap";

import DefaultSwap from "./DefaultSwap";

export default class HomeToWorkSwap extends DefaultSwap {
    async transition() {
        const homeVideo = document.getElementById("homeVideo");
        const homeGrid = document.getElementById("homeGrid");
        const homeNavigation = document.getElementById("homeNavigation");

        const homeGridItems =
            homeGrid?.querySelectorAll(".grid-item > div") || [];
        const bgVideoNew = this.doc.getElementById("backgroundVideo");

        this.tl = gsap.timeline({
            paused: true,
            defaults: { duration: 1.5, ease: "power4.out" },
        });
        this.tl.to(homeGrid, { scale: 1 });
        this.tl.to(homeVideo, { scale: 0.20833333, opacity: 0 }, "<");
        this.tl.from(homeGridItems, { scale: 0.2 }, "<");
        this.tl.to(
            homeNavigation,
            { x: -100, opacity: 0, duration: 0.8, ease: "power2.out" },
            "<",
        );

        return this.tl.play();
    }
}
