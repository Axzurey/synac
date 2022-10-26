export namespace ArtisanClasses {
    let geowedge = new Instance("WedgePart");
    geowedge.Anchored = true;
    geowedge.TopSurface = Enum.SurfaceType.Smooth;
    geowedge.BottomSurface = Enum.SurfaceType.Smooth;

    export class triangle {
        points = {a: new Vector3(), b: new Vector3(), c: new Vector3()};
        properties: Map<keyof WritableInstanceProperties<WedgePart>, any> = new Map();
        w0: WedgePart = geowedge.Clone();
        w1: WedgePart = geowedge.Clone();
        width0 = 0;
        width1 = 0;
        constructor(a: Vector3, b: Vector3, c: Vector3, width0?: number, width1?: number, properties?: Map<keyof WritableInstanceProperties<WedgePart>, any>) {
            this.setpoints(a, b, c);
            this.properties = properties || new Map();
            this.setwidth(width0 || 0, width1 || 0);
        }
        setpoints(a: Vector3, b: Vector3, c: Vector3) {
            this.points.a = a;
            this.points.b = b;
            this.points.c = c;
        }
        setwidth(width0: number, width1: number) {
            this.width0 = width0;
            this.width1 = width1;
        }
        destroy() {
            this.w0.Destroy();
            this.w1.Destroy();
        }
        draw(parent: Instance) {
            this.properties.forEach((val, key) => {
                this.w0[key as never] = val as never;
                this.w1[key as never] = val as never;
            });

            let [a, b, c] = [this.points.a, this.points.b, this.points.c];
            let [ab, ac, bc] = [b.sub(a), c.sub(a), c.sub(b)];
            let [abd, acd, bcd] = [ab.Dot(ab), ac.Dot(ac), bc.Dot(bc)];

            if (abd > acd && abd > bcd) {
                [c, a] = [a, c];
            }
            else if (acd > bcd && acd > abd) {
                [a, b] = [b, a];
            }

            [ab, ac, bc] = [b.sub(a), c.sub(a), c.sub(b)];

            let right = ac.Cross(ab).Unit;
            let up = bc.Cross(right).Unit;
            let back = bc.Unit;

            let height = math.abs(ab.Dot(up));

            this.w0.Size = new Vector3(this.width0, height, math.abs(ab.Dot(back)));
            this.w0.CFrame = CFrame.fromMatrix(a.add(b).div(2), right, up, back);
            this.w0.Parent = parent;

            this.w1.Size = new Vector3(this.width1, height, math.abs(ac.Dot(back)));
            this.w1.CFrame = CFrame.fromMatrix(a.add(c).div(2), right.mul(-1), up, back.mul(-1));
            this.w1.Parent = parent;
        }
    }
    let linepart = new Instance("Part");
    linepart.Anchored = true;
    export class line {
        properties: Map<Partial<keyof WritableInstanceProperties<Part>>, any>;
        points: {a: Vector3, b: Vector3}
        width0: number
        width1: number
        w0: Part = linepart.Clone();
        constructor(a: Vector3, b: Vector3, width0?: number, width1?: number, properties?: Map<Partial<keyof WritableInstanceProperties<Part>>, any>) {
            this.properties = properties || new Map();
            this.points = {
                a: a,
                b: b
            };
            this.width0 = width0 || .1;
            this.width1 = width1 || .1
        }
        setpoints(a: Vector3, b: Vector3, c: Vector3) {
            this.points.a = a;
            this.points.b = b;
        }
        setwidth(width0: number, width1: number) {
            this.width0 = width0;
            this.width1 = width1;
        }
        destroy() {
            this.w0.Destroy()
        }
        draw(parent: Instance) {
            this.properties.forEach((val, key) => {
                this.w0[key as never] = val as never;
            });
            let lookat = CFrame.lookAt(this.points.b, this.points.a);
            let length = this.points.a.sub(this.points.b).Magnitude;
            let size = new Vector3(this.width0, this.width1, length);
            this.w0.CFrame = lookat.mul(new CFrame(0, 0, -length / 2));
            this.w0.Size = size;
            this.w0.Parent = parent;
        }
    }
}

export namespace Artisan {
    export function DrawTri(a: Vector3, b: Vector3, c: Vector3, width0?: number, width1?: number, properties?: Map<Partial<keyof WritableInstanceProperties<WedgePart>>, any>): Raylibclasses.triangle {
        return new ArtisanClasses.triangle(a, b, c, width0, width1, properties);
    }
    export function DrawLine(a: Vector3, b: Vector3, width0?: number, width1?: number, properties?: Map<Partial<keyof WritableInstanceProperties<Part>>, any>): Raylibclasses.line {
        return new ArtisanClasses.line(a, b, width0, width1, properties);
    }
}