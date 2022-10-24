import { RunService, Workspace } from "@rbxts/services";
import { ProjectilePointShell } from "shared/projection/projectile";
import { ctxServer } from "./server framework/ctxServer";

print('hello from the server!')

//const server = new ctxServer()

const b = new Instance('Part');
b.Shape = Enum.PartType.Ball;
b.Anchored = true;
b.CanCollide = false;
b.CanQuery = false;
b.Size = new Vector3(1, 1, 1)
b.Name = 'b'
b.Color = new Color3(0, 1, 1)
b.Parent = Workspace;
b.Position = new Vector3(0, 10, 0)

task.wait(5)

print('READY')

let p = new ProjectilePointShell({
    initialPosition: new Vector3(0, 10, 0),
    initialVelocity: new Vector3(0, 1, 0),
    ignoresDescendants: (hit) => false,
    mass: 1,
    elasticity: 1
})

RunService.Heartbeat.Connect((dt) => {
    p.update(dt);
    b.Position = p.position;
})