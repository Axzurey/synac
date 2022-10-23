import { t } from "@rbxts/t";
import remoteProtocol from "shared/modules/remoteProtocol";

const protocols = {
    fireBullet: {
        protocol: new remoteProtocol<(player: Player, at: CFrame) => void, (at: CFrame) => void>
        ('fire_bullet', [t.instanceOf('Player'), t.CFrame])
    }
}

export default protocols;