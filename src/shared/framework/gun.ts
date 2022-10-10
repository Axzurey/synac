import { getCamera } from "shared/framework/exposed";
import paths from "shared/globalPaths";
import path from "shared/modules/path";
import { animationCompiler } from "shared/modules/sweep";
import utils from "shared/modules/utils";
import { ctxMain } from "./ctxmain";

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

export class gun {
    firerate: number = 0;

    ammo: number = 0;
    maxAmmo: number = 30;
    reserveAmmo: number = 210;
    reloadToChamber: boolean = true;

    loadedAnimations: Partial<Record<animationTypes, AnimationTrack>> = {}

    viewmodel: gunViewModel;

    equipped: boolean = false;

    constructor(private ctx: ctxMain, public payload: gunPayload) {
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

    update(dt: number) {
        if (!this.equipped) return;
        const camera = getCamera();

        this.viewmodel.PivotTo(camera.CFrame);
    }
}