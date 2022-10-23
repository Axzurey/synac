import { Players, Workspace } from "@rbxts/services"
import { Human } from "server/serverclasses/human";
import system from "shared/game/system";
import { createEntity } from "shared/nylon";
import { Entity } from "shared/nylon/entity"
import { serverGun } from "./serverGun";

export class ctxServer {
    constructor() {
        
        Workspace.WaitForChild("homies").GetChildren().forEach((v) => {
            let t = new Human()
            t.health = 100;
            t.vessel = v;
            createEntity(t)
        })
        
        const playerStuff: {[k: number]: serverGun} = {}
        
        system.server.on('fireBullet', (player, at) => {
            playerStuff[player.UserId].fire(at)
        })
        
        Players.PlayerAdded.Connect((p) => {
            let g = new serverGun(this, p)
            playerStuff[p.UserId] = g;
        })
    }
}