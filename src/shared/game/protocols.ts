import { t } from "@rbxts/t";
import remoteProtocol from "shared/modules/remoteProtocol";

const protocols = {
    fireBullet: {
        protocol: new remoteProtocol<(player: Player, at: CFrame) => void, () => void>('fire_bullet', [t.CFrame])
    }
}

export default protocols;