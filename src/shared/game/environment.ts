import { ReplicatedStorage, RunService } from "@rbxts/services";
import tree, { castTree } from "shared/modules/tree";

namespace environment {
    /**
     * 
     * @returns it waits for the server to create the environment and then returns it
     */
     export function getSharedEnvironment() {
        return env;
    }

    let bothType = {
        Remotes: {
            $className: 'Folder',
            $properties: {
                Name: 'Remotes'
            }
        }
    } as const;

    export const env = RunService.IsServer()? tree.createTree(tree.createFolder('sharedEnvironment', ReplicatedStorage), bothType) :
        ReplicatedStorage.WaitForChild('sharedEnvironment') as castTree<Folder, typeof bothType>;
}

export = environment;