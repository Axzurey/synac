import { RunService } from "@rbxts/services";
import { getInterpolation, interpolableTypes, valueRef } from "./chroni";

interface colorfulKeyframe<T extends interpolableTypes> {
    time: number,
    interpolationMode: Enum.EasingStyle,
    interpolationDirection: Enum.EasingDirection,
    value: T
}

export interface colorfulAnimation<T extends interpolableTypes> {
    keyframes: colorfulKeyframe<T>[]
    timeElapsed: number
    ref: valueRef<T>
    reverseOnComplete: boolean
    direction: 1 | -1
    paused: boolean
    loop: boolean
}

/**
 * Animates a value reference.
 * @param reverseOnComplete if this is true, loop should not be true
 * @param loop if this is true, reverseOnComplete should not be true. This will override reverseOnComplete
 */
export function animateValue<T extends interpolableTypes>(valueref: valueRef<T>, keyframes: colorfulKeyframe<T>[], reverseOnComplete: boolean = false, loop: boolean = false) {
    let animation: colorfulAnimation<T> = {
        timeElapsed: 0,
        keyframes: keyframes,
        ref: valueref,
        reverseOnComplete: reverseOnComplete,
        direction: 1,
        paused: false,
        loop: loop,
    }
    animateQueue.push(animation);
    return {
        pause: () => animation.paused = true,
        reset: () => animation.timeElapsed = 0,
        play: () => animation.paused = false,
        cancel: () => animateQueue.remove(animateQueue.indexOf(animation)),
    }
}

let animateQueue: colorfulAnimation<interpolableTypes>[] = [];

RunService.Heartbeat.Connect((dt) => {
    const toRemove: number[] = [];

    animateQueue.forEach((v, ni) => {

        if (v.paused) return;

        v.timeElapsed += dt * v.direction;

        let currentKeyframe: colorfulKeyframe<interpolableTypes> | undefined = undefined;
        let nextKeyframe: colorfulKeyframe<interpolableTypes> | undefined = undefined;

        for (let i = 0; i < v.keyframes.size(); i++) {
            let k = v.keyframes[i];
            if (v.timeElapsed < k.time) {
                currentKeyframe = v.keyframes[i - 1];
                nextKeyframe = k;
                break;
            }
        }

        if (!currentKeyframe || !nextKeyframe) {
            v.ref.setValue(v.keyframes[v.keyframes.size() - 1].value);
            if (v.loop) {
                v.timeElapsed = 0;
            }
            else if (v.reverseOnComplete) {
                v.direction *= -1;
                v.timeElapsed = v.direction === 1 ? 0 : v.keyframes[v.keyframes.size() - 1].time;
            }
            else {
                v.timeElapsed = 0;
                v.paused = true;
            }
            return;
        }

        let out = getInterpolation(currentKeyframe.value, nextKeyframe.value, currentKeyframe.time, nextKeyframe.time, v.timeElapsed + currentKeyframe.time, currentKeyframe.interpolationMode, currentKeyframe.interpolationDirection)

        v.ref.setValue(out);
    })
})