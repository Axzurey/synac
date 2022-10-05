import { getCamera } from "shared/modules/exposed";
import { ctxMain } from "./ctxmain";

export type amputatedGunViewmodel = Model & {
    aimpart: Part,
    barrel: MeshPart & {
        exhaust: Attachment
    },
    mag: MeshPart
}

export type gunViewModel = amputatedGunViewmodel & {
    leftArm: MeshPart,
    rightArm: MeshPart,
    rootPart: Part
}

export class gun {
    firerate: number = 0;

    ammo: number = 0;
    maxAmmo: number = 30;
    reserveAmmo: number = 210;
    reloadToChamber: boolean = true;

    constructor(private ctx: ctxMain) {
        
    }

    update(dt: number) {
        const camera = getCamera();

        
    }
}