import { RunService } from "@rbxts/services";

class timeStep<T> {
    constructor(private value: T) {};
    public getValue(): T {return this.value};
    public setValue(value: T) {this.value = value};
}

export enum timeStepInterpolationMode {
    linear,
}

type interpolableTypes = CFrame | Vector3 | number | Color3

export function useTime<T extends interpolableTypes>(initial: T) {
    return new timeStep<T>(initial);
}

export function interpolateTime<T extends timeStep<any>>(t: number, target: T, interpolationModel: timeStepInterpolationMode = timeStepInterpolationMode.linear) {
    
}

function startRenstep() {

    let conn = RunService.Heartbeat.Connect((dt) => {

    })
}

startRenstep() //just start it when imported lmfao