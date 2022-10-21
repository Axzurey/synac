import { Players, RunService } from "@rbxts/services"
import { getSharedEnvironment } from "shared/game/environment"
import {t} from '@rbxts/t';
import { verifyRemoteArgs } from "./utils";

type anyFunctionVoid = (...args: never[]) => void
type playerFuncVoid = (player: Player, ...args: never[]) => void

interface protocolListener<T extends anyFunctionVoid> {
    callback?: T
	disconnect: () => void
	called?: true
	once?: true
	passedArgs?: Parameters<T>
	disconnected: boolean
}

const dev = true;

export type GetGenericOfClassServer<T> = T extends remoteProtocol<infer A, infer _> ? A : never;
export type GetGenericOfClassClient<T> = T extends remoteProtocol<infer _, infer B> ? B : never;

/**
 * the parameters of the generic are what the component recieves: FireServer would send Parameters<Server>
 */
export default class remoteProtocol<Server extends playerFuncVoid, Client extends anyFunctionVoid> {
	private listeners: protocolListener<Server | Client>[] = [];
    private remote: RemoteEvent

    constructor(uniqueAlias: string, expected: t.check<any>[]) {
        if (RunService.IsServer()) {
            this.remote = new Instance('RemoteEvent');
            this.remote.Name = `protocol:${uniqueAlias}`;
            this.remote.Parent = getSharedEnvironment().Remotes;

            this.remote.OnServerEvent.Connect((client, ...args: unknown[]) => {
                this.listeners.forEach((v) => {
                    task.spawn(() => {
						if (v.callback) {
							let t = verifyRemoteArgs([client, ...args], expected);
							if (!t && dev) {
                                throw `args for remote ${uniqueAlias} do not comply!`
                            }
                            else if (!t) {
                                return;
                            };
	                        let callback = v.callback as Server;
                            let a = args as never[]
	                        callback(client, ...a)
	                    }
					})
                })
            })
        }
        else {
            this.remote = getSharedEnvironment().Remotes.WaitForChild(`protocol:${uniqueAlias}`) as RemoteEvent;
            this.remote.OnClientEvent.Connect((...args: unknown[]) => {
                this.listeners.forEach((v) => {
                    task.spawn(() => {
						if (v.callback) {
	                        let callback = v.callback as Client;
                            let a = args as never[]
	                        callback(...a)
	                    }
					})
                })
            })
        }
    }

    private disconnectSomething(d: protocolListener<Server | Client>) {
		let index = this.listeners.indexOf(d);
		if (d.disconnected) {
			throw `unable to disconnect a connection that has already been disconnected`
		}
		if (index !== -1) {
			d.disconnected = true;
			this.listeners.remove(index);
		}
	}

    private addListener(constructed: protocolListener<Server | Client>) {;
        this.listeners.push(constructed)
    }

	public listenServer(callback: Server) {
        let c: protocolListener<Server> = {
            callback: callback,
            disconnected: false,
            disconnect: () => {
                this.disconnectSomething(c)
            },
        }
        this.addListener(c);
        return c;
	}

    public listenClient(callback: Client) {
        let c: protocolListener<Client> = {
            callback: callback,
            disconnected: false,
            disconnect: () => {
                this.disconnectSomething(c)
            },
        }
        this.addListener(c);
        return c;
	}

    public fireClient(client: Player, args: Parameters<Client>) {
        if (RunService.IsClient()) throw `this method may not be called from the client!`;

        this.remote.FireClient(client, ...args as unknown[]);
    }
    public fireClients(clients: Player[], args: Parameters<Client>) {
        if (RunService.IsClient()) throw `this method may not be called from the client!`;

        clients.forEach((client) => {
            this.remote.FireClient(client, ...args as unknown[]);
        })
    }
    public fireAllClientsExcept(blacklist: Player[], args: Parameters<Client>) {
        if (RunService.IsClient()) throw `this method may not be called from the client!`;

        Players.GetPlayers().forEach((client) => {
            if (blacklist.indexOf(client) !== -1) return;
            this.remote.FireClient(client, ...args as unknown[]);
        })
    }
    public fireServer(args: omitFirstValueOfArray<Parameters<Server>>) {
        if (RunService.IsServer()) throw `this method may not be called from the client!`;

        this.remote.FireServer(...args);
    }

    public destroy() {
        if (RunService.IsClient()) throw `this method may not be called from the client!`;
        this.listeners.forEach((v) => {
            v.disconnect()
        })

        this.remote.Destroy();
    }
}