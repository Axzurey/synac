import { Players, Workspace } from "@rbxts/services";


export function getCamera(): Camera {
    if (!Workspace.CurrentCamera) throw `player doesn't have a camera set...`
    return Workspace.CurrentCamera;
}