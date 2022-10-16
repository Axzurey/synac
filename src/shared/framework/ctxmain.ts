import { RunService, UserInputService } from "@rbxts/services";
import { interpolateValue, timeStepInterpolationMode, useValue } from "shared/modules/chroni";
import { animateValue } from "shared/modules/colorful";
import spring from "shared/physics/spring";
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
        aim: Enum.UserInputType.MouseButton2
    })

    loadout = {
        primary: new gun(this, this.keybinds, {pathToGun: 'ReplicatedStorage//guns//hk416', attachments: {
            sight: {
                path: 'ReplicatedStorage//sights//holographic'
            }
        }, animations: {
            idle: 'rbxassetid://11256660598',
        }})
    }

    equipped: keyof typeof this.loadout = 'primary'
    
    getEquippedItem(): gun {
        return this.loadout[this.equipped];
    }

    setEquippedItem(item: keyof typeof this.loadout) {
        this.equipped = item;
        this.getEquippedItem().equip();
    }
    
    constructor() {
        const renderConn = RunService.RenderStepped.Connect(dt => this.update(dt));
        const keyDownConn = UserInputService.InputBegan.Connect((input, gp) => {
            if (gp) return;

            if (this.keybinds.checkIsAction('aim', input)) {
                this.toggleAim(true);
            }
        })
        const keyUpConn = UserInputService.InputEnded.Connect((input) => {

            if (this.keybinds.checkIsAction('aim', input)) {
                this.toggleAim(false);
            }
        })
        this.setEquippedItem('primary');
    }

    toggleAim(t: boolean) {
        this.status.aiming = true;
        interpolateValue(.25, t ? 1 : 0 as number, this.aimDelta, timeStepInterpolationMode.quadOut)
    }

    update(dt: number) {
        let item = this.getEquippedItem();
        if (!item) return;
        
        item.update(dt);
    }
}