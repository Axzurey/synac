export type trivert = [Vector3, Vector3, Vector3];

export type partvert = [Part, Part, Part];

export default class triangle {
    constructor(private vertices: trivert) {
        
    }
    getVertices() {
        return this.vertices;
    }
    /**
    origin, direction
     */
    doesRayIntersect(o: Vector3, r: Vector3) {
        let [a, b, c] = this.vertices;

        let n = (b.sub(a)).Cross(c.sub(a)); //the plane the triangle lies on

        let d = - n.Dot(a /** any vertex is fine */);

        let den0 = (n.Dot(r));

        if (den0 === 0) return false; //ray can never intersect, for it is parallel to the triangle's normal plane

        let t = - ((n.Dot(o)) + d) / den0;

        if (t < 0) return false; //the triangle is behind the ray

        let p = o.add(r.mul(t)); //the point of the ray's intersection with the triangle

        const edges = [b.sub(a), c.sub(b), a.sub(c)];

        for (let [i, v] of pairs(edges)) {
            let cE = p.sub(this.vertices[i - 1]);
            if (n.Dot(v.Cross(cE)) <= 0) {
                return false; //if any of these are false, then the point does not lie inside the triangle
            }
        }

        return p;
    }
}