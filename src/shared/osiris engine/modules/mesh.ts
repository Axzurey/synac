import { Workspace } from "@rbxts/services";
import { Raylib } from "./raylib";
import triangle from "./triangle";

export default class mesh {
    constructor(private triangles: triangle[]) {
        
    }
    setTriangles(triangles: triangle[]) {
        this.triangles = triangles;
    }
    async constructMesh() {
        this.triangles.forEach((v) => {
            task.spawn(() => {
                let [v0, v1, v2] = v.getVertices()
                Raylib.DrawTri(v0, v1, v2, .001, .001).draw(Workspace)
            })
        })
    }
    async constructWireframe() {
        this.triangles.forEach((v) => {
            task.spawn(() => {
                let [v0, v1, v2] = v.getVertices()
                let l1 = Raylib.DrawLine(v0, v1, .1, .1)
                l1.draw(Workspace);
                let l2 = Raylib.DrawLine(v1, v2, .1, .1)
                l2.draw(Workspace);
                let l3 = Raylib.DrawLine(v2, v0, .1, .1)
                l3.draw(Workspace);
                delay(1 / 60, () => {
                    l1.destroy();
                    l2.destroy();
                    l3.destroy();
                })
            })
        })
    }
    isPointInside(p: Vector3) {
        let start = new Vector3(-1000, -1000, -10000); //example(i know poly will not be in this area)
        let direction = CFrame.lookAt(start, p).LookVector;
        let distance = (start.sub(p)).Magnitude;

        let t = 0

        for (const [i, v] of pairs(this.triangles)) {
            let z = v.doesRayIntersect(start, direction);
            if (z) {

                let mag = (z.sub(start)).Magnitude;
                if (mag > distance) continue; //this is not allowed, because it exceeds the ray length

                t += 1
            }
        }
        if (t % 2 !== 0) return true; return false;
    }
}