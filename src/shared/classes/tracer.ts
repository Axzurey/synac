import { RunService, Workspace } from "@rbxts/services";

interface tracerData {
    color: Color3,
    origin: Vector3,
    direction: Vector3,
    width: number,
    speed: number,
}

const tracerParent = new Instance("Part");
tracerParent.Anchored = true;
tracerParent.Transparency = 1;
tracerParent.CanCollide = false;
tracerParent.CanQuery = false;
tracerParent.CanTouch = false;
tracerParent.Position = new Vector3(0, -1000, 0);
tracerParent.Name = 'tracer_bin c:'
tracerParent.Parent = Workspace;

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
        this.tracerAttachment.Parent = tracerParent;
    }
    destroy() {
        tracerPool.remove(tracerPool.indexOf(this));
    }
    update(dt: number) {
        let targetP = this.position.add(this.data.direction.mul(dt).mul(this.data.speed));
        this.tracerAttachment.Position = targetP;
    }
}

const tracerPool: tracer[] = [];

const tracerUpdater = RunService.RenderStepped.Connect((dt) => {
    tracerPool.forEach(v => v.update(dt));
})