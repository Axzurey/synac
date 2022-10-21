import { RunService } from "@rbxts/services";
import path from "shared/modules/path";
export class tracer {
    constructor(origin: Vector3, direction: Vector3, lifeTime: number, color: Color3) {

        let t = 1;
        let velocity = 100;

        let bin = new Instance('Part');
        bin.Anchored = true;
        bin.CanCollide = false;
        bin.CanTouch = false;
        bin.CanQuery = false;
        bin.Size = new Vector3();
        bin.Position = origin.add(direction.mul(t));
        bin.Transparency = 1;
        bin.Parent = path.createIfMissing('Workspace//ignore', 'Folder');;

        let a1 = new Instance('Attachment');
        a1.Position = new Vector3(0, 0, 2);
        a1.Parent = bin;
        let a2 = new Instance('Attachment');
        a2.Position = new Vector3(0, 0, -2);
        a2.Parent = bin;

        let b = new Instance('Trail');
        b.Brightness = 100;
        b.Color = new ColorSequence(color);
        b.Lifetime = 1;
        b.LightInfluence = 0;
        b.FaceCamera = true;
        b.WidthScale = new NumberSequence(.01);
        b.MaxLength = 100;

        b.Attachment0 = a1;
        b.Attachment1 = a2;

        b.Parent = bin;

        let start = tick();

        let rs = RunService.RenderStepped.Connect((dt) => {
            t += velocity * dt;
            if (tick() - start >= lifeTime) {
                rs.Disconnect();
                bin.Destroy();
                return;
            }
            let d = origin.add(direction.mul(t));
            bin.CFrame = CFrame.lookAt(d, d.mul(2));
        });
    }
}