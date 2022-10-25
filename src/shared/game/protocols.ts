import { t } from "@rbxts/t";
import remoteProtocol from "shared/modules/remoteProtocol";

const protocols = {
    fireBullet: {
        protocol: new remoteProtocol<(player: Player, at: Vector3, to: Vector3) => void, (at: Vector3, to: Vector3) => void>
        ('fire_bullet', [t.instanceOf('Player'), t.Vector3, t.Vector3])
    }
}

export default protocols;