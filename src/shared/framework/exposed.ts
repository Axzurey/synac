import { Players, Workspace } from "@rbxts/services";


export function getCamera(): Camera {
    if (!Workspace.CurrentCamera) throw `player doesn't have a camera set...`
    return Workspace.CurrentCamera;
}

type CharacterModel = Model & {
    HumanoidRootPart: Part,
    Head: Part,
    Humanoid: Humanoid
}

export function getCharacter(): CharacterModel | undefined {
    return Players.LocalPlayer.Character! as CharacterModel | undefined;
}