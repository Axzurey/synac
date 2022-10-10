import { Workspace } from "@rbxts/services";

export function popIndex<T extends any[], I extends number>(a: T, index: I): PopArrayType<T, I> {
    a.remove(index);
    return a as PopArrayType<T, I>;
}

export class animationCompiler {
    animation: Animation
    private constructor(public id: string) {
        this.animation = new Instance("Animation");
        this.animation.AnimationId = id;
        this.animation.Parent = Workspace;
    }

    public static create(id: string) {
        return new this(id);
    }

    public get() {
        return this.animation;
    }

    public cleanUp() {
        this.animation.Destroy();
    }
}