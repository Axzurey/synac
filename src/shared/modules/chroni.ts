import { RunService, TweenService } from "@rbxts/services";
import { colorfulAnimation } from "./colorful";
import mathf, { lerp } from "./mathf";
import { deserialize, serialize } from "./serenity";
import { popIndex } from "./sweep";

//time, begin, change (target - begin), duration

export function getInterpolation<T extends interpolableTypes>(v0: T, v1: T, start: number, final: number, t: number, style: Enum.EasingStyle = Enum.EasingStyle.Linear, direction: Enum.EasingDirection = Enum.EasingDirection.In) {
    
    let tx = mathf.normalize(start, final, t);
    let alpha = TweenService.GetValue(tx, style, direction);

    if (typeIs(v0, 'CFrame') && typeIs(v1, 'CFrame')) {
        return v0.Lerp(v1, alpha);
    }
    else if (typeIs(v0, 'Color3') && typeIs(v1, 'Color3')) {
        return v0.Lerp(v1, alpha);
    }
    else if (typeIs(v0, 'Vector3') && typeIs(v1, 'Vector3')) {
        return v0.Lerp(v1, alpha);
    }
    else if (typeIs(v0, 'number') && typeIs(v1, 'number')) {
        return lerp(v0, v1, alpha);
    }
    else {
        throw `${typeOf(v0)} is not an interpolable type!`
    }
}

export class valueRef<T extends interpolableTypes> {
    constructor(private value: T) {};
    public getValue(): T {return this.value};
    public setValue(value: T) {this.value = value};
}

export type interpolableTypes = CFrame | Vector3 | number | Color3

export function useValue<T extends interpolableTypes>(initial: T) {
    return new valueRef<T>(initial);
}

export function interpolateValue<T extends valueRef<Z>, Z extends interpolableTypes>(t: number, target: Z, valueRef: T, interpolationMode: Enum.EasingStyle = Enum.EasingStyle.Linear, interpolationDirection: Enum.EasingDirection = Enum.EasingDirection.In) {
    const payload: interpolationQueuePayload<Z> = {
        initialValue: valueRef.getValue(),
        interpolationMode: interpolationMode,
        interpolationDirection: interpolationDirection,
        timeEnd: t,
        timeElapsed: 0,
        target: target,
        valueRef: valueRef
    }

    stepQueue.push(payload);

    return {
        cancel: () => {
            let i = stepQueue.indexOf(payload);
            if (i === -1) return;

            stepQueue.remove(i);
        }
    }
}

const stepQueue: interpolationQueuePayload<interpolableTypes>[] = [];

interface interpolationQueuePayload<T extends interpolableTypes> {
    initialValue: T
    target: T,
    interpolationMode: Enum.EasingStyle,
    interpolationDirection: Enum.EasingDirection,
    timeEnd: number,
    timeElapsed: number,
    valueRef: valueRef<T>
}

function startRenstep() {

    let conn = RunService.Heartbeat.Connect((dt) => {
        let toremove: number[] = []
        stepQueue.forEach((payload, i) => {

            payload.timeElapsed = math.clamp(payload.timeElapsed + dt, 0, payload.timeEnd);

            let initial = payload.initialValue;
            let t = payload.timeElapsed;
            let timeEnd = payload.timeEnd;
            let target = payload.target;
            let ref = payload.valueRef;
            let mode = payload.interpolationMode;
            let dir = payload.interpolationDirection;

            let out = getInterpolation(initial, target, 0, timeEnd, t, mode, dir);

            ref.setValue(out);

            if (payload.timeElapsed >= timeEnd) {
                toremove.push(i)
            }
        })

        toremove.forEach((v) => {
            stepQueue.remove(v);
        })
    })
}

startRenstep() //just start it when imported lmfao