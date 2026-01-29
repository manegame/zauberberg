import { gsap } from "gsap";

import DefaultSwap from "../DefaultSwap";

export default class HomeToDirectorSwap extends DefaultSwap {
    async transition(): Promise<any> {
        // const banner = this.doc.getElementById("director-banner");
        // this.tl = gsap.timeline({
        //     paused: true,
        // });
        // this.tl.from(banner, {
        //     yPercent: -100,
        //     duration: 0.8,
        //     ease: "power2.out",
        // });
        // return this.tl.play();
    }
}
