import { RunService, TweenService } from "@rbxts/services";

class valueRef<T> {
    constructor(private value: T) {};
    public getValue(): T {return this.value};
    public setValue(value: T) {this.value = value};
}

//time, begin, change (target - start), duration
const interpolations = {
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

export enum timeStepInterpolationMode {
    linear,
}

type interpolableTypes = CFrame | Vector3 | number | Color3

export function useValue<T extends interpolableTypes>(initial: T) {
    return new valueRef<T>(initial);
}

export function interpolateTime<T extends valueRef<Z>, Z extends interpolableTypes>(t: number, target: Z, valueRef: T, interpolationMode: timeStepInterpolationMode = timeStepInterpolationMode.linear) {
    const payload: interpolationQueuePayload<Z> = {
        initialValue: valueRef.getValue(),
        interpolationMode: interpolationMode,
        timeEnd: t,
        timeElapsed: 0,
        target: target,
        valueRef: valueRef
    }

    return {
        cancel: () => {
            let i = stepQueue.indexOf(payload);
            if (i === -1) return;

            stepQueue.remove(i);
        }
    }
}

const stepQueue: interpolationQueuePayload<any>[] = [];

interface interpolationQueuePayload<T extends interpolableTypes> {
    initialValue: T
    target: T,
    interpolationMode: timeStepInterpolationMode,
    timeEnd: number,
    timeElapsed: number,
    valueRef: valueRef<T>
}

function startRenstep() {

    let conn = RunService.Heartbeat.Connect((dt) => {
        stepQueue.forEach((payload) => {
            let initial = payload.initialValue;
            let t = payload.timeElapsed;
            let timeEnd = payload.timeEnd;
            let target = payload.target;
            let ref = payload.valueRef;
            let mode = payload.interpolationMode;

            payload.timeElapsed += dt;
        })
    })
}

startRenstep() //just start it when imported lmfao