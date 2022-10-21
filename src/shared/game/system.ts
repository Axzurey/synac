import { RunService } from "@rbxts/services";
import { GetGenericOfClassClient, GetGenericOfClassServer } from "shared/modules/remoteProtocol";
import protocols from "./protocols";

namespace system {
    export namespace client {
        export function invokeProtocol<T extends keyof typeof protocols>(
            protocol: T, ...args: Parameters<GetGenericOfClassClient<(typeof protocols)[T]["protocol"]>>) {
            if (RunService.IsServer()) throw `protocol ${protocol} can not be invoked from the server!`;

            protocols[protocol].protocol.fireServer(args as never);
        }
        export function on<T extends keyof typeof protocols>(protocol: T, callback: GetGenericOfClassClient<(typeof protocols[T])['protocol']>) {
            if (RunService.IsServer()) throw `protocol ${protocol} can not be listened to from the server!`;
            return protocols[protocol].protocol.listenClient(callback as never);
        }
    }
    export namespace server {
        export function invokeProtocol<T extends keyof typeof protocols>(
            protocol: T, client: Player, ...args: Parameters<GetGenericOfClassServer<(typeof protocols)[T]["protocol"]>>) {
            if (RunService.IsClient()) throw `protocol ${protocol} can not be invoked from the client!`;

            protocols[protocol].protocol.fireClient(client, args as never);
        }
        export function on<T extends keyof typeof protocols>(protocol: T, callback: GetGenericOfClassServer<(typeof protocols[T])['protocol']>) {
            if (RunService.IsClient()) throw `protocol ${protocol} can not be listened to from the client!`;
            return protocols[protocol].protocol.listenServer(callback as never);
        }
    }
}

export default system;