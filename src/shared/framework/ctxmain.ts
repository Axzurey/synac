import { RunService } from "@rbxts/services";
import { timeStepInterpolationMode, useValue } from "shared/modules/chroni";
import { animateValue } from "shared/modules/colorful";
import { gun } from "./gun";
import { keybinds } from "./keybinds";

export class ctxMain {
    aimDelta = useValue(0 as number);
    aimOffset = useValue(0 as number);

    status = {
        aiming: false,
    }

    keybinds = new keybinds({
        fire: Enum.UserInputType.MouseButton1,
        firemode: Enum.KeyCode.V,
        reload: Enum.KeyCode.R,
    })

    loadout = {
        primary: new gun(this, this.keybinds, {pathToGun: 'ReplicatedStorage//guns//hk416', attachments: {}, animations: {
            idle: '',
            reload: '',
            reload_full: ''
        }})
    }

    equipped: keyof typeof this.loadout = 'primary'
    
    getEquippedItem(): gun {
        return this.loadout[this.equipped];
    }

    setEquippedItem(item: keyof typeof this.loadout) {
        this.equipped = item;
    }

    constructor() {
        RunService.RenderStepped.Connect(dt => this.update(dt));

    }

    toggleAim(t: boolean) {
        this.status.aiming = true;
        animateValue(this.aimDelta, [
            {time: 0, value: this.aimDelta.getValue(), interpolationMode: timeStepInterpolationMode.linear},
            {time: 1 - (t ? this.aimDelta.getValue() : -this.aimDelta.getValue()), value:  t ? 1 : 0, interpolationMode: timeStepInterpolationMode.linear},
        ])
    }

    update(dt: number) {
        let item = this.getEquippedItem();
        if (!item) return;
        
        item.update(dt);

        
    }
}