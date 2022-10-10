import { RunService, TweenService } from "@rbxts/services";
import { colorfulAnimation } from "./colorful";
import { deserialize, serialize } from "./serenity";
import { popIndex } from "./sweep";

//time, begin, change (target - begin), duration
export const interpolations = {
    linear: (t: number, b: number, c: number, d: number) => c * t / d + b,
    quadIn: (t: number, b: number, c: number, d: number) => c * math.pow(t / d, 2) + b,
    quadOut: (t: number, b: number, c: number, d: number) => {
        t /= d;
        return -c * t * (t - 2) + b;
    },
    quadInOut: (t: number, b: number, c: number, d: number) => {
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * math.pow(t, 2) + b
        }
        else {
            return -c / 2 * ((t - 1) * (t - 3) - 1) + b;
        }
    },
    cubicIn: (t: number, b: number, c: number, d: number) => c * math.pow(t, 3) + b,
    cubicOut: (t: number, b: number, c: number, d: number) => {
        t = t / d - 1;
        return c * (math.pow(t, 3) + 1) + b;
    },
    cubicInOut: (t: number, b: number, c: number, d: number) => {
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * t * t * t + b;
        }
        else {
            t -= 2;
            return c / 2 * (t * t * t + 2) + b
        }
    },
    quartIn: (t: number, b: number, c: number, d: number) => c * math.pow(t / d, 4) + b,
    quartOut: (t: number, b: number, c: number, d: number) => {
        t = t / d - 1;
        return -c * (math.pow(t, 4) - 1) + b;
    },
    quartInOut: (t: number, b: number, c: number, d: number) => {
        t = t / d * 2;
        if (t > 1) {
            return c / 2 * math.pow(t, 4) + b;
        }
        else {
            t -= 2;
            return -c / 2 * (math.pow(t, 4) - 2) + b;
        }
    }
} as const;

export class valueRef<T extends interpolableTypes> {
    constructor(private value: T) {};
    public getValue(): T {return this.value};
    public setValue(value: T) {this.value = value};
}

export enum timeStepInterpolationMode {
    linear = "linear",
    quadIn = "quadIn",
    quadOut = "quadOut",
    quadInOut = "quadInOut",
    cubicIn = "cubicIn",
    cubicOut = "cubicOut",
    cubicInOut = "cubicInOut",
    quartIn = "quartIn",
    quartOut = "quartOut",
    quartInOut = "quartInOut"
}

export type interpolableTypes = CFrame | Vector3 | number | Color3

export function useValue<T extends interpolableTypes>(initial: T) {
    return new valueRef<T>(initial);
}

export function interpolateValue<T extends valueRef<Z>, Z extends interpolableTypes>(t: number, target: Z, valueRef: T, interpolationMode: timeStepInterpolationMode = timeStepInterpolationMode.linear) {
    const payload: interpolationQueuePayload<Z> = {
        initialValue: valueRef.getValue(),
        interpolationMode: interpolationMode,
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
    interpolationMode: timeStepInterpolationMode,
    timeEnd: number,
    timeElapsed: number,
    valueRef: valueRef<T>
}

export function calculateValueForInterpolation<T extends interpolableTypes>(t: number, timeEnd: number, initial: T, target: T, intMode: timeStepInterpolationMode): T {
    let _in1 = serialize(initial);
    let _tgt = serialize(target);

    let out: any = undefined;

    let int = interpolations[intMode];

    if (typeIs(_in1, 'table') && typeIs(_tgt, 'table')) {
        let typ = (_in1 as any)[0]

        let in1 = popIndex(_in1 as number[], 0);
        let tgt = popIndex(_tgt as number[], 0);

        in1.forEach((init, i) => {
            let c = tgt[i] - init;

            let newValue = int(math.clamp(t, 0, timeEnd), init, c, timeEnd);

            in1[i] = newValue
        })
        out = deserialize([typ, ...in1]);
    }
    else if (typeIs(_in1, 'number') && typeIs(_tgt, 'number')) {
        let c = _tgt - _in1;

        let newValue = int(math.clamp(t, 0, timeEnd), _in1, c, timeEnd);

        out = newValue;
    }
    else {
        throw `unexpected error for ${typeOf(initial)}. It may not be supported!`;
    }
    return out;
}

function startRenstep() {

    let conn = RunService.Heartbeat.Connect((dt) => {
        let toremove: number[] = []
        stepQueue.forEach((payload, i) => {
            let initial = payload.initialValue;
            let t = payload.timeElapsed;
            let timeEnd = payload.timeEnd;
            let target = payload.target;
            let ref = payload.valueRef;
            let mode = payload.interpolationMode;

            let out = calculateValueForInterpolation(t + dt, timeEnd, initial, target, mode)

            ref.setValue(out);

            payload.timeElapsed += dt;

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