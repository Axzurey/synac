import mesh from "./modules/mesh";
import triangle, { partvert, trivert } from "./modules/triangle";

namespace osiris {
    export function createMesh(tris: trivert[]) {
        return new mesh(tris.map((v) => {
            return new triangle(v);
        }));
    }
}

export = osiris;