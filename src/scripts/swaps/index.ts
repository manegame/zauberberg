import HomeToWork from "./ToWork/FromHome";
import HomeToDirector from "./ToDirector/FromHome";
import DefaultSwap from "./DefaultSwap";

export const DEFAULT_SWAP_TRANSITION = DefaultSwap;

export const SWAPS_TRANSITIONS = {
    "/": {
        "/work": HomeToWork,
        "/a-v-rockwell": HomeToDirector,
    },
};
