import { RunService, UserInputService } from "@rbxts/services";
import { interpolateValue, useValue } from "shared/modules/chroni";
import { animateValue } from "shared/modules/colorful";
import spring from "shared/physics/spring";
import { getCamera } from "./exposed";
import { gun } from "./gun";
import { keybinds } from "./keybinds";

export class ctxMain {
    aimDelta = useValue(0 as number);
    cameraLeanOffset = useValue(new CFrame());
    leanOffset = useValue(new CFrame());
    stanceOffset = useValue(new CFrame());

    status = {
        aiming: false,
        leanDirection: 0 as 1 | 0 | -1,
        stance: 0 as 1 | 0 | -1
    }

    staticOffsets = {
        leanRight: CFrame.fromEulerAnglesYXZ(0, 0, math.rad(-16)),
		leanLeft: CFrame.fromEulerAnglesYXZ(0, 0, math.rad(16)),
		leanRightCamera: new CFrame(1, 0, 0).mul(CFrame.fromEulerAnglesYXZ(0, 0, math.rad(-5))),
		leanLeftCamera: new CFrame(-1, 0, 0).mul(CFrame.fromEulerAnglesYXZ(0, 0, math.rad(5))),
        stanceCrouch: new CFrame(0, -1, 0),
        stanceProne: new CFrame(0, -2, 0)
    }

    keybinds = new keybinds({
        fire: Enum.UserInputType.MouseButton1,
        firemode: Enum.KeyCode.V,
        reload: Enum.KeyCode.R,
        aim: Enum.UserInputType.MouseButton2,
        leanLeft: Enum.KeyCode.Q,
        leanRight: Enum.KeyCode.E,
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
            if (this.keybinds.checkIsAction('leanLeft', input)) {
                this.toggleLean(-1)
            }
            if (this.keybinds.checkIsAction('leanRight', input)) {
                this.toggleLean(1)
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
        interpolateValue(.25, t ? 1 : 0 as number, this.aimDelta);
    }

    toggleStance(d: 1 | 0 | -1) {

    }

    toggleLean(d: 1 | 0 | -1) {
        if (d === this.status.leanDirection) d = 0;

        let leanOffset = new CFrame();
        let cameraLeanOffset = new CFrame();

        print(d)

        if (d === 1) {
            leanOffset = this.staticOffsets.leanRight;
            cameraLeanOffset = this.staticOffsets.leanRightCamera;
        }
        if (d === -1) {
            leanOffset = this.staticOffsets.leanLeft;
            cameraLeanOffset = this.staticOffsets.leanLeftCamera;
        }

        this.status.leanDirection = d;

        interpolateValue(.2, cameraLeanOffset, this.cameraLeanOffset);
        interpolateValue(.2, leanOffset, this.leanOffset);
    }

    update(dt: number) {
        let item = this.getEquippedItem();
        if (!item) return;
        
        item.update(dt);

        const camera = getCamera();

        camera.CFrame = camera.CFrame
        .mul(this.cameraLeanOffset.getValue())
    }
}