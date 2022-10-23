import { RunService, UserInputService } from "@rbxts/services";
import { interpolateValue, useValue } from "shared/modules/chroni";
import { animateValue } from "shared/modules/colorful";
import { createDebounce } from "shared/modules/sweep";
import spring from "shared/physics/spring";
import { getCamera, getCharacter } from "./exposed";
import { gun } from "./gun";
import { keybinds } from "./keybinds";
import { viewBob } from "./view";

export class ctxMain {
    aimDelta = useValue(0 as number);
    cameraLeanOffset = useValue(new CFrame());
    leanOffset = useValue(new CFrame());
    stanceOffset = useValue(new CFrame());

    springs = {
        
    }

    cameraRecoil = spring.create(5, 75, 3, 4);

    debounces = {
        stance: createDebounce(.1),
        ads: createDebounce(.05),
        lean: createDebounce(.1),
    }

    status = {
        aiming: false,
        leanDirection: 0 as 1 | 0 | -1,
        stance: 1 as 1 | 0 | -1
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
        crouch: Enum.KeyCode.C,
        prone: Enum.KeyCode.LeftControl
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
            if (this.keybinds.checkIsAction('crouch', input)) {
                this.toggleStance(0)
            }
            if (this.keybinds.checkIsAction('prone', input)) {
                this.toggleStance(-1)
            }
        })

        const keyUpConn = UserInputService.InputEnded.Connect((input) => {

            if (this.keybinds.checkIsAction('aim', input)) {
                this.toggleAim(false);
            }
        })


        this.setEquippedItem('primary');
    }

    toggleAim(t: boolean, override: boolean = false) {
        this.debounces.ads.pass(override);
        this.status.aiming = t;
        interpolateValue(.25, t ? 1 : 0 as number, this.aimDelta);
    }

    toggleStance(d: 1 | 0 | -1, override: boolean = false) {
        this.debounces.stance.pass(override);
        let prev = this.status.stance;
        if (d === this.status.stance) d = 1;

        let stanceOffset = new CFrame();

        if (d === 0) {
            stanceOffset = this.staticOffsets.stanceCrouch;
        }
        else if (d === -1) {
            stanceOffset = this.staticOffsets.stanceProne;
        }

        this.status.stance = d;

        let intTime = .25;

        if (prev === -1) {
            intTime = .75;
        }
        if (d === -1) {
            intTime = .75;
        }

        interpolateValue(intTime, stanceOffset, this.stanceOffset);
    }

    toggleLean(d: 1 | 0 | -1, override: boolean = false) {
        this.debounces.lean.pass(override);
        if (d === this.status.leanDirection) d = 0;

        let leanOffset = new CFrame();
        let cameraLeanOffset = new CFrame();

        if (d === 1) {
            leanOffset = this.staticOffsets.leanRight;
            cameraLeanOffset = this.staticOffsets.leanRightCamera;
        }
        else if (d === -1) {
            leanOffset = this.staticOffsets.leanLeft;
            cameraLeanOffset = this.staticOffsets.leanLeftCamera;
        }

        this.status.leanDirection = d;

        interpolateValue(.2, cameraLeanOffset, this.cameraLeanOffset);
        interpolateValue(.2, leanOffset, this.leanOffset);
    }

    update(dt: number) {
        const item = this.getEquippedItem();
        const character = getCharacter();

        if (!item || !character) return;
        
        item.update(dt);

        const camera = getCamera();

        const cameraRecoil = this.cameraRecoil.update(dt);

        camera.CFrame = camera.CFrame
        .mul(this.stanceOffset.getValue())
        .mul(CFrame.Angles(cameraRecoil.X, cameraRecoil.Y, 0))
        .mul(this.cameraLeanOffset.getValue())
    }
}