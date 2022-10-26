import { Artisan } from "./modules/artisan";
import mesh from "./modules/mesh";
import triangle, { trivert } from "./modules/triangle";

namespace osiris {
    export function createMesh(tris: trivert[]) {
        return new mesh(tris.map((v) => {
            return new triangle(v);
        }));
    }

    export function drawLine(p0: Vector3, p1: Vector3, width: number = .1, color: Color3 = new Color3(0, 1, 1)) {
        let cmap = new Map(color)
        return Artisan.DrawLine(p0, p1, width, width, m);
    }
}

export = osiris;