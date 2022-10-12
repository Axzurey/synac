import { RunService } from "@rbxts/services";

interface tracerData {
    color: Color3,
    origin: Vector3,
    direction: Vector3,
    width: number,
    speed: number,
}

export class tracer {
    position: Vector3;
    tracerAttachment: Attachment & {
        tracer: Beam
    };
    constructor(private data: tracerData) {
        this.position = data.origin;

        let trace = new Instance('Attachment');

        let beam = new Instance("Beam");
        beam.Parent = trace;

        this.tracerAttachment = trace as typeof this.tracerAttachment;
    }
    destroy() {
        tracerPool.remove(tracerPool.indexOf(this));
    }
    update(dt: number) {
        let targetP = this.position.add(this.data.direction.mul(dt).mul(this.data.speed));
    }
}

const tracerPool: tracer[] = [];

const tracerUpdater = RunService.RenderStepped.Connect((dt) => {
    tracerPool.forEach(v => v.update(dt));
})