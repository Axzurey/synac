import { Human } from "server/serverclasses/human";
import nylon from "shared/nylon";
import { getBodyPart } from "./category";
import { ctxServer } from "./ctxServer";

export class serverGun {
    damage = {
        head: 200,
        body: 30,
        limb: 15
    }
    constructor(private ctx: ctxServer, public client: Player) {

    }
    fire(position: Vector3, direction: Vector3) {

        lin

        let result = nylon.queryRaycast({
            origin: position,
            direction: direction,
            magnitude: 999,
            excludeDescendants: (v) => {
                if (v.IsDescendantOf(this.client.Character!)) return true;

                if (v.Name === 'HumanoidRootPart') return true;
                return false;
            }
        })

        if (!result) return;

        if (result.isEntity) {
            let entity = result.entityBuffer.entity

            if (entity instanceof Human) { //only checks static members for the type...
                let bodyhit = getBodyPart(result.instance.Name);

                print(bodyhit, result.instance.Name)

                if (!bodyhit) return;

                entity.takeDamage(this.damage[bodyhit]);
            }

        }
    
        print(result)
    }
}