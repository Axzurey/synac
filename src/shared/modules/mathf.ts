namespace mathf {
    //local
    const randomGenerator = new Random();
    const sin = math.sin;
    const tan = math.tan;
    const abs = math.abs;
    const cos = math.cos; //can swap with sin for roblox lookvector space
    const atan2 = math.atan2;
    const asin = math.asin;
    const acos = math.acos;
    const rad = math.rad; //:: x * pi / 180 
    const deg = math.deg; //:: x * 180 / pi
    const pi = math.pi;

    //types

    //constants
    export const inf = math.huge;
    export const e = 2.718281;
    export const tau = pi * 2;
    export const phi = 2.618033;
    export const earthGravity = 9.807;
    export const lightSpeed = 299792458;
    
    //functions
    export function angleBetween(v1: Vector3, v2: Vector3): number {
        return acos(math.clamp(v1.Dot(v2), -1, 1));
    }
    export function vectorIsClose(v1: Vector3, v2: Vector3, limit: number): boolean {
        return v1.sub(v2).Magnitude <= limit ? true : false;
    };
    export function vector2IsSimilar(v1: Vector2, v2: Vector2, limit: number): boolean {
        if (math.abs(v1.X - v2.X) > limit) return false;
        if (math.abs(v1.Y - v2.Y) > limit) return false;
        return true;
    };
    export function random(min: number = 0, max: number = 1, count: number = 1): number | number[] {
        if (count === 1) {
            return randomGenerator.NextNumber(min, max);
        }
        else {
            let numbers: number[] = [];
            for (let i=0; i < count; i++) {
                numbers.push(randomGenerator.NextNumber(min, max));
            }
            return numbers;
        }
    };
    export function pointsOnCircle(radius: number, points: number, center?: Vector2): Vector2[] {
        let parray: Vector2[] = []
        let cpo = 360 / points
        for (let i = 1; i <= points; i++) {
            let theta = math.rad(cpo * i)
            let x = cos(theta) * radius
            let y = sin(theta) * radius
            parray.push(center? new Vector2(x, y).add(center) : new Vector2(x, y))
        }
        return parray
    };
    export function translationRequired(a: CFrame, b: CFrame): CFrame {
        return a.Inverse().mul(b);
    };
    export function vector2FromAngle(angle: number, radius?: number): Vector2 { //for a unit circle
        return new Vector2(cos(rad(angle) * (radius || 1)), sin(rad(angle)) * (radius || 1)) // x = cos(angle:rad) * r, y = sin(angle:rad) * r
    };
    export function angleFromVector2(v: Vector2): number { //for a unit circle
        return atan2(v.Y, v.X); //theta = atan2(y, x)
    }
    export function normalize(min: number, max: number, value: number): number {
        if (value > max) return max;
        if (value < min) return min;
        return (value - min) / (max - min);
    }
    export function denormalize(min: number, max: number, value: number): number {
        return (value * (max - min) + min);
    }
    export function uExtendingSpiral(t: number) {
        return new Vector2(t * cos(t), t * sin(t));
    }
    /**
     * 
     * @param x1 line 1 x1
     * @param x2 line 1 x2
     * @param y1 line 1 y1
     * @param y2 line 1 y2
     * @param x3 line 2 x1
     * @param x4 line 2 x2
     * @param y3 line 2 y1
     * @param y4 line 2 y2
     * [x, y], [x, y] --line1
     * [x, y], [x, y] --line2
     * @returns the x and y co-ordinates that the lines intersect at. If they do not intersect, it returns undefined.
     */
    export function getConvergence(x1: number, x2: number, y1: number, y2: number, x3: number, x4: number, y3: number, y4: number) {
        let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) return;
        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        return [u, t];
    }
    export function uSquare(rotation: number = 0, radius: number): Vector2[] {
        let cx = 0;
        let cy = 0;
        function rotate(v1: Vector2) {
            let tx = v1.X - cx;
            let ty = v1.Y - cy;

            let rotatedX = tx * cos(rotation) - ty * sin(rotation);
            let rotatedY = tx * sin(rotation) - ty * cos(rotation);

            return new Vector2(rotatedX + cx, rotatedY + cy);
        }
        let x1 = new Vector2(1, 1).mul(radius);
        let x2 = new Vector2(1, -1).mul(radius);
        let x3 = new Vector2(-1, -1).mul(radius);
        let x4 = new Vector2(-1, 1).mul(radius);
        return [rotate(x1), rotate(x2), rotate(x3), rotate(x4)];
    }
    export function slope(v1: Vector2, v2: Vector2): number {
        return (v2.Y - v1.Y) / (v2.X - v1.X);
    }
    export function lerp(v0: number, v1: number, t: number): number {
        return v0 + (v1 - v0) * t
    }
    export function lerpV3(v0: Vector3, v1: Vector3, t: number): Vector3 {
        return v0.add(v1.sub(v0).mul(t));
    }
    export function degToRad(args: [number, number, number]) {
        let newargs: [number, number, number] = [-1, -1, -1];
        args.forEach((v, i) => {
            newargs[i] = math.rad(v);
        })
        return newargs;
    }
    export function computeDistanceFromLineSegment(a: Vector3, b: Vector3, c: Vector3) {
        let px = a.sub(b).Cross(c.sub(b)).Magnitude;
        let py = c.sub(b).Magnitude;
        return px / py;
    }
    export function percentToDegrees(percent: number) {
        return percent * 360 / 100;
    }
    export function xToDegrees(x: number, clamp: number) {
        return x * 360 / clamp;
    }
    export function degreesToPercent(degrees: number) {
        return degrees / 360 * 100;
    }
    export function bezierQuadratic(t: number, p0: number, p1: number, p2: number): number {
        return (1 - t) ^ 2 * p0 + 2 * (1 - t) * t * p1 + t ^ 2 * p2;
    }
    export function bezierQuadraticV3(t: number, p0: Vector3, p1: Vector3, p2: Vector3): Vector3 {
        let l1 = lerpV3(p0, p1, t);
        let l2 = lerpV3(p1, p2, t);
        let q = lerpV3(l1, l2, t);
        return q;
    }
    /**
     * 
     * @param part the part to check for the point on
     * @param point the point to get the closest vector on the part to
     * @returns 
     */
    export function closestPointOnPart(part: BasePart, point: Vector3) {
        let t = part.CFrame.PointToObjectSpace(point);
        let hs = part.Size.div(2);

        return part.CFrame.mul(new Vector3(
            math.clamp(t.X, -hs.X, hs.X),
            math.clamp(t.Y, -hs.Y, hs.Y),
            math.clamp(t.Z, -hs.Z, hs.Z),
        ))
    }
    export function pointsOnSphere(fidelity: number) {
        let points: Vector3[] = []
        let goldenRatio = 1 + math.sqrt(5) / 4
        let angleIncrement = math.pi * 2 * goldenRatio
        let multiplier = 10

        for (let i = 0; i < fidelity; i++) {
            let distance = i / fidelity
            let incline = math.acos(1 - 2 * distance)
            let azimuth = angleIncrement * i

            let x = math.sin(incline) * math.cos(azimuth) * multiplier
            let y = math.sin(incline) * math.sin(azimuth) * multiplier
            let z = math.cos(incline) * multiplier

            points.push(new Vector3(x, y, z))

        }
        return points;
    }
}

export = mathf;