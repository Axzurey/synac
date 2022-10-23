import { Entity } from "shared/nylon/entity";

export enum HumanState {
    ALIVE,
    DBNO,
    DEAD
}

const DAMAGE_DBNO_DIFFERENCE = 25;

export class Human extends Entity {
    state: HumanState = HumanState.ALIVE;
    health: number = 0;
    takeDamage(d: number) {
        let newHealth = this.health - d;

        let oldHealth = this.health;

        //fix health up, might change.
        if (newHealth < 0) {
            this.health = 0
        }
        else {
            this.health = newHealth;
        }

        //calculate dbno
        if (this.health === 0) {
            if (math.abs(this.health - oldHealth) < DAMAGE_DBNO_DIFFERENCE) {
                this.state = HumanState.DBNO;
            }
            else {
                this.state = HumanState.DEAD;
            }
        }

        let h = this.vessel!.WaitForChild('Humanoid') as Humanoid;
        h.Health = this.health;
    }
}