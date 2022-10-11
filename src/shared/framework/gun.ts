import { UserInputService } from "@rbxts/services";
import { getCamera } from "shared/framework/exposed";
import paths from "shared/globalPaths";
import path from "shared/modules/path";
import { animationCompiler } from "shared/modules/sweep";
import utils from "shared/modules/utils";
import { ctxMain } from "./ctxmain";
import { keybinds } from "./keybinds";

export type gunModel = Model & {
    aimpart: Part,
    barrel: MeshPart & {
        exhaust: Attachment
    },
    mag: MeshPart,
    sightNode: Part
}

export type gunArms = Model & {
    leftArm: MeshPart,
    rightArm: MeshPart,
    rootPart: Part,
    controller: AnimationController & {animator: Animator}
}

export type sightModel = Model & {
    focus: Part
}

export type gunViewModel = gunArms & gunModel

type animationTypes = 'reload' | 'reload_full' | 'idle'

interface gunPayload {
    pathToGun: string,
    animations: Record<animationTypes, string>,
    attachments: attachmentPayload
}

interface attachmentDescriptor {
    path: string,
}

interface attachmentPayload {
    sight?: attachmentDescriptor
}

enum fireMode {
	AUTO,
	SEMI,
	BURST2,
	BURST3,
	SHOTGUN
}

export class gun {
    firerate: number = 0;

    ammo: number = 0;
    maxAmmo: number = 30;
    reserveAmmo: number = 210;
    reloadToChamber: boolean = true;

    loadedAnimations: Partial<Record<animationTypes, AnimationTrack>> = {};

    viewmodel: gunViewModel;

    equipped: boolean = false;

	firemode: fireMode = fireMode.AUTO;

	firemodes: fireMode[] = [fireMode.AUTO, fireMode.BURST3, fireMode.SEMI];

	fireRates: Record<fireMode, number> = {
		[fireMode.AUTO]: 600,
		[fireMode.BURST2]: 600,
		[fireMode.BURST3]: 600,
		[fireMode.SEMI]: 600,
		[fireMode.SHOTGUN]: 100
	};

	burstDelay: number = 9 / 60;

	shotgunShells: number = 12;

	mouseDownDebounce: boolean = false;

	lastFired: number = tick();

	cycleFireMode(): fireMode {
		if (this.firemode === this.firemodes.size() - 1) {
			return this.firemodes[0]
		}
		return this.firemodes.indexOf(this.firemode + 1);
	}

	getFireMode(): fireMode {
		return this.firemode;
	}

    constructor(private ctx: ctxMain, private keybinds: keybinds, public payload: gunPayload) {

        let gun = path.sure(payload.pathToGun).Clone();

		//get the viewmodel from path
		let viewmodel = path.sure(paths.fps.standard_viewmodel).Clone() as gunViewModel;

		//copy gun stuff to the viewmodel
		gun.GetChildren().forEach((v) => {
			v.Parent = viewmodel;
		})

		utils.instanceUtils.unanchorAllDescendants(viewmodel);
		utils.instanceUtils.nominalizeAllDescendants(viewmodel);

		let ap = viewmodel.aimpart;
		let vm = viewmodel;

		let m0 = new Instance("Motor6D");
		m0.Part0 = ap;
		m0.Name = 'rightMotor';
		m0.Part1 = vm.rightArm;
		m0.Parent = vm;

		let m1 = new Instance("Motor6D");
		m1.Part0 = ap;
		m1.Part1 = vm.leftArm;
		m1.Name = 'leftMotor';
		m1.Parent = vm;

		let m2 = new Instance("Motor6D");
		m2.Part0 = vm.rootPart;
		m2.Part1 = ap;
		m2.Name = 'rootMotor';
		m2.Parent = vm;

		viewmodel.PrimaryPart = viewmodel.aimpart;

		this.viewmodel = viewmodel;
		this.viewmodel.PivotTo(getCamera().CFrame);

		this.viewmodel.Parent = getCamera()

		for (const [name, id] of pairs(payload.animations)) {
			let anim = animationCompiler.create(id)
			let final = anim.get()
			this.loadedAnimations[name] = viewmodel.controller.animator.LoadAnimation(final)

			anim.cleanUp()
		}

		if (payload.attachments.sight) {
			let sightmodel = path.sure(payload.attachments.sight.path).Clone() as sightModel;
			sightmodel.PivotTo(viewmodel.sightNode.CFrame)
			sightmodel.Parent = viewmodel;

			let md = new Instance('Motor6D');
			md.Part0 = viewmodel.sightNode;
			md.Part1 = sightmodel.PrimaryPart;
			md.Parent = sightmodel.PrimaryPart;

			viewmodel.aimpart.Position = sightmodel.focus.Position;
		}

		utils.instanceUtils.unanchorAllDescendants(viewmodel);
		utils.instanceUtils.nominalizeAllDescendants(viewmodel);

		this.viewmodel.Parent = undefined;
    }

	fire() {
		
	}

    update(dt: number) {
        if (!this.equipped) return;
        const camera = getCamera();

        this.viewmodel.PivotTo(camera.CFrame);

		let FMSEMISHOTGUN = (this.getFireMode() === fireMode.SEMI || this.getFireMode() === fireMode.SHOTGUN);

		if (this.keybinds.getActionIsDown('fire')) {
			if (FMSEMISHOTGUN) {
				if (this.mouseDownDebounce === false) {
					this.mouseDownDebounce = true;
					this.keybinds.doKeyRaisedOnce('fire', () => this.mouseDownDebounce = false);
				}
			}

			switch (this.getFireMode()) {
				case fireMode.BURST2:
					for (let i = 0; i < 2; i++) {
						this.fire();
						task.wait(this.burstDelay);
					}
					break;
				case fireMode.BURST3:
					for (let i = 0; i < 3; i++) {
						this.fire();
						task.wait(this.burstDelay);
					}
					break;
				case fireMode.SHOTGUN:
					for (let i = 0; i < this.shotgunShells; i++) {
						this.fire();
						task.wait(this.burstDelay);
					}
					break;
				default:
					this.fire();
					break;
			}
		}
    }
}