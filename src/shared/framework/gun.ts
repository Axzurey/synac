import { UserInputService } from "@rbxts/services";
import { tracer } from "shared/classes/tracer";
import { getCamera, getCharacter } from "shared/framework/exposed";
import system from "shared/game/system";
import paths from "shared/globalPaths";
import path from "shared/modules/path";
import { animationCompiler } from "shared/modules/sweep";
import utils, { later, tableUtils } from "shared/modules/utils";
import spring from "shared/physics/spring";
import { ctxMain } from "./ctxmain";
import { keybinds } from "./keybinds";
import { viewBob } from "./view";

export type gunModel = Model & {
    aimpart: Part,
    barrel: MeshPart & {
        muzzle: Attachment
    },
    mag: MeshPart,
    sightNode: Part,
	offsets: {
		idle: CFrameValue
	}
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

type animationTypes = 'idle' //'reload' | 'reload_full' | 

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

	springs = {
		recoil: spring.create(5, 85, 3, 10),
		walkSway: new Vector3()
	}

	recoilIndex: number = 0;

	recoilPattern: Map<NumberRange, [Vector3, Vector3]> = tableUtils.toMap([
        new NumberRange(0, 10),
        new NumberRange(10, 20),
        new NumberRange(20, 31)
    ], [
        [new Vector3(.2, .3, .2), new Vector3(.7, 1, .2)],
        [new Vector3(.2, .7, .3), new Vector3(.6, .8, .3)],
        [new Vector3(.7, .9, .2), new Vector3(.5, .5, .4)]
    ]);

	recoilRegroupTime: number = 1;

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
		let random = new Random();

		let cameraCFrame = getCamera().CFrame;

		let spread = (1 - this.ctx.aimDelta.getValue()) * 5;

		let origin = cameraCFrame.Position;
		let direction = cameraCFrame.mul(CFrame.Angles(
			math.rad(math.random(-spread, spread)),
			math.rad(math.random(-spread, spread)),
			0
		)).LookVector;

		print(direction, cameraCFrame.LookVector)

		let t = tick();
		this.lastFired = t;

		this.recoilIndex ++;

		later(this.recoilRegroupTime, () => {
			if (this.lastFired !== t) return;
			this.recoilIndex --;
		});

		let max = tableUtils.rangeUpperClamp(this.recoilPattern)!

		let recoilIndex = this.recoilIndex >= max ? max: this.recoilIndex;

		let add = tableUtils.firstNumberRangeContainingNumber(this.recoilPattern, recoilIndex)!;

		let pickX = random.NextNumber(math.min(add[0].X, add[1].X), math.max(add[0].X, add[1].X)) / 15;
		let pickY = random.NextNumber(math.min(add[0].Y, add[1].Y), math.max(add[0].Y, add[1].Y)) / 15;
		let pickZ = random.NextNumber(math.min(add[0].Z, add[1].Z), math.max(add[0].Z, add[1].Z)) / 2;

		this.springs.recoil.shove(new Vector3(0, 0, pickZ));
		this.ctx.cameraRecoil.shove(new Vector3(pickX, -pickY, 0));

		let mp = this.viewmodel.barrel.muzzle.WorldPosition.add(cameraCFrame.LookVector.mul(3))

		let trace = new tracer(mp, direction, 2, Color3.fromRGB(82, 33, 5));

		system.client.invokeProtocol('fireBullet', origin, direction)
	}

	unequip() {
		this.viewmodel.Parent = undefined;
		this.equipped = false;
	}

	equip() {
		this.viewmodel.Parent = getCamera();
		this.equipped = true;
	}

    update(dt: number) {
        if (!this.equipped) return;
        const camera = getCamera();

		const character = getCharacter()!;
		
		let recoil = this.springs.recoil.update(dt);

		this.viewmodel.aimpart.Anchored = true;

		const velocity = character.HumanoidRootPart.AssemblyLinearVelocity;

		this.springs.walkSway = this.springs.walkSway
		.Lerp(new Vector3(viewBob(10, .01), viewBob(5, .01), viewBob(5, .01)).mul(velocity.Magnitude * (1 - this.ctx.aimDelta.getValue())), .1);

		const walkSway = this.springs.walkSway;

		let viewmodelOffset = camera.CFrame.mul(new CFrame(0, 0, -.1)
		.Lerp(this.viewmodel.offsets.idle.Value, 1 - this.ctx.aimDelta.getValue()))
		.mul(this.ctx.stanceOffset.getValue())
		.mul(new CFrame(walkSway.X / 10, walkSway.Y / 10, 0))
		.mul(this.ctx.cameraLeanOffset.getValue())
		.mul(new CFrame(0, 0, recoil.Z))
		.mul(this.ctx.leanOffset.getValue())

        this.viewmodel.PivotTo(viewmodelOffset);

		let FMSEMISHOTGUN = (this.getFireMode() === fireMode.SEMI || this.getFireMode() === fireMode.SHOTGUN);

		if (this.keybinds.getActionIsDown('fire') && tick() - this.lastFired > 60 / this.fireRates[this.getFireMode()]) {
			this.lastFired = tick();
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

		if (this.loadedAnimations['idle'] && !this.loadedAnimations['idle'].IsPlaying) {
			this.loadedAnimations['idle'].Play();
		}
    }
}