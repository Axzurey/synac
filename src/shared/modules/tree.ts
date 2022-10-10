import { ReplicatedStorage } from "@rbxts/services";

interface InstanceTree {
	$className?: keyof Instances;
    $properties?: Record<keyof WritableInstanceProperties<any>, any>;
	[Key: string]: keyof Instances | undefined | InstanceTree | Record<keyof WritableInstanceProperties<any>, any>;
}

type EvaluateInstanceTree<T extends InstanceTree, D = Instance> = (T extends {
	$className: keyof Instances;
    $properties: keyof WritableInstanceProperties<any>
}
	? Instances[T["$className"]]
	: D) &
	{
		[K in Exclude<Exclude<keyof T, "$className">, '$properties'>]: KeyExtendsPropertyName<
			T,
			K,
			T[K] extends keyof Instances
				? Instances[T[K]]
				: T[K] extends InstanceTree
				? EvaluateInstanceTree<T[K]>
				: never
		>;
};

type KeyExtendsPropertyName<T extends InstanceTree, K, V> = K extends "Changed"
	? true
	: T extends {
			$className: keyof Instances;
	  }
	? K extends keyof Instances[T["$className"]]
		? unknown
		: V
	: V;

export type castTree<I extends Instance, T extends InstanceTree> = I & EvaluateInstanceTree<T, I>

export default abstract class tree {
    static createTree<I extends Instance, T extends InstanceTree>(
        container: I,
        tree: T,
    ) {
        let l = tree["$className"];
        let x: Instance | undefined
        if (l) {
            x = new Instance(l as keyof CreatableInstances)
        }
        for (const [i, v] of pairs(tree)) {
            if (i === '$className') continue;
            if (i === '$properties' && x) {
                for (const [r, t] of pairs(v)) {
                    x[r as keyof WritableInstanceProperties<typeof x>] = t as never
                }
            }
            else if (typeOf(v) === 'table') {
                this.createTree(container, v);
            }
            /*
            else if(typeOf(v) === 'string' && !container[i as keyof typeof container]) {
                let n = new Instance(v as keyof CreatableInstances);
                n.Parent = x;
            }*/
        }
        if (x) {
            x.Parent = container;
        }
        return container as I & EvaluateInstanceTree<T, I>
    }
    static createFolder(name: string, parent: Instance) {
        let l = new Instance("Folder");
        l.Name = name;
        l.Parent = parent;
        return l;
    }
}