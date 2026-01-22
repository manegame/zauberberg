import HomeToWork from "./HomeToWork";
import DefaultSwap from "./DefaultSwap";

export const DEFAULT_SWAP_TRANSITION = DefaultSwap;

export const SWAPS_TRANSITIONS = {
    "/": {
        "/work": HomeToWork,
    },
};
