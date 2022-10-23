const GRAVITY_CONSTANT = -9.8;

interface ProjectileConstructorParams {
    initialVelocity: Vector3,
    initialPosition: Vector3,
    mass: number,
    elasticity: number
}

export class Projectile {
    velocity: Vector3 = new Vector3();
    acceleration: Vector3 = new Vector3();
    position: Vector3 = new Vector3();

    constructor(private params: ProjectileConstructorParams) {
        this.position = params.initialPosition;
        this.velocity = params.initialVelocity;
    }

    update(dt: number) {
        this.acceleration = this.acceleration.add(new Vector3(0, GRAVITY_CONSTANT * dt, 0));
        TODO HERE
    }
}