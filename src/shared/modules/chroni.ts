import { RunService } from "@rbxts/services";

class timeValue<T> {
    constructor(private value: T) {};
    public getValue(): T {return this.value};
    public setValue(value: T) {this.value = value};
}

export enum timeStepInterpolationMode {
    linear,
}

type interpolableTypes = CFrame | Vector3 | number | Color3

export function useValue<T extends interpolableTypes>(initial: T) {
    return new timeValue<T>(initial);
}

export function interpolateTime<T extends timeValue<Z>, Z extends interpolableTypes>(t: number, target: Z, timeValue: T, interpolationMode: timeStepInterpolationMode = timeStepInterpolationMode.linear) {
    const payload: interpolationQueuePayload<Z> = {
        initialValue: timeValue.getValue(),
        interpolationMode: interpolationMode,
        timeEnd: t,
        timeElapsed: 0,
        target: target
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
    timeValue: timeValue<T>
}

function startRenstep() {

    let conn = RunService.Heartbeat.Connect((dt) => {
        stepQueue.forEach((payload) => {
            let initial = payload.initialValue;
            let t = payload.timeElapsed;
            let timeEnd = payload.timeEnd;
            let target = target;
            let mode = payload.interpolationMode;

            payload.timeElapsed += dt;
        })
    })
}

startRenstep() //just start it when imported lmfao