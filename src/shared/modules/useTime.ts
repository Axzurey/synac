import { RunService } from "@rbxts/services";

class timeVar<T> {
    constructor(private value: T) {};
    public getValue(): T {return this.value};
    public setValue(value: T) {this.value = value};
}

export enum timeStepInterpolationMode {
    linear,
}

type interpolableTypes = CFrame | Vector3 | number | Color3

export function useTime<T extends interpolableTypes>(initial: T) {
    return new timeVar<T>(initial);
}

export function interpolateTime<T extends timeVar<Z>, Z extends interpolableTypes>(t: number, target: T, interpolationMode: timeStepInterpolationMode = timeStepInterpolationMode.linear) {
    const payload: interpolationQueuePayload<Z> = {
        initialValue: target.getValue(),
        interpolationMode: interpolationMode,
        timeEnd: t,
        timeElapsed: 0,
        target: target
    }
}

interface interpolationQueuePayload<T extends interpolableTypes> {
    initialValue: T
    interpolationMode: timeStepInterpolationMode,
    timeEnd: number,
    timeElapsed: number,
    target: timeVar<T>
}

function startRenstep() {

    let conn = RunService.Heartbeat.Connect((dt) => {

    })
}

startRenstep() //just start it when imported lmfao