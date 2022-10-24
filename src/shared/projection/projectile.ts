import { Workspace } from "@rbxts/services";

const GRAVITY_CONSTANT = -9.8;

const AIR_DENSITY = 1.225;

const DRAG_COEFFICIENT = .5;

interface ProjectileConstructorParams {
    initialVelocity: Vector3,
    initialPosition: Vector3,
    mass: number,
    elasticity: number,
    ignoresDescendants: (hit: BasePart) => boolean
}

function reflectNormal(d: Vector3, n: Vector3) {
    return d.sub(n.mul(d.Dot(n) * 2));
}

function calculateDrag(velocity: Vector3) {
    const csa = .785 //cross sectional area of a sphere with diameter 1
    return velocity.mul(velocity).mul(AIR_DENSITY * DRAG_COEFFICIENT * .5 * csa);
}

function recurse(origin: Vector3, direction: Vector3, ignore: BasePart[], checkIgnore: (hit: BasePart) => boolean): RaycastResult | undefined {

    const ignoreList = new RaycastParams();
    ignoreList.FilterDescendantsInstances = ignore;

    let result = Workspace.Raycast(origin, direction, ignoreList);

    if (!result) return;

    if (checkIgnore(result.Instance)) {
        ignore.push(result.Instance);
        return recurse(origin, direction, ignore, checkIgnore);
    }

    return result;
}

function reCast(origin: Vector3, direction: Vector3, checkIgnore: (hit: BasePart) => boolean) {
    return recurse(origin, direction, [], checkIgnore);
}

export class ProjectilePointShell {
    velocity: Vector3 = new Vector3();
    acceleration: Vector3 = new Vector3();
    position: Vector3 = new Vector3();

    constructor(private params: ProjectileConstructorParams) {
        this.position = params.initialPosition;
        this.velocity = params.initialVelocity;

        this.acceleration = new Vector3(0, GRAVITY_CONSTANT * params.mass, 0)
    }

    update(dt: number) {
        const lastPosition = this.position;
        
        this.velocity = this.velocity.add(this.acceleration.mul(dt));
        
        let targetPosition = this.position.add(this.velocity);

        let relativeDirection = targetPosition.sub(lastPosition);

        let result = reCast(lastPosition, relativeDirection.mul(relativeDirection.Magnitude), this.params.ignoresDescendants);
        
        if (result) {
            let reflectedDampened = reflectNormal(relativeDirection.Unit, result.Normal)//.mul(this.params.elasticity).mul(relativeDirection.Magnitude);
            //find a way to make this include velocity as well, without it being unreasonable.
            //calculate how much velocity is lost from an impact.
            TODO: YOU ARE HERE

            this.velocity = this.velocity.mul(this.params.elasticity);

            this.position = reflectedDampened;

            print('hitsmth', reflectedDampened)
        }
        else {
            this.position = targetPosition;
        }

        this.velocity = this.velocity.add(calculateDrag(this.velocity).mul(dt));
    }
}