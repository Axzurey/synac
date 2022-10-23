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

export class Debounce {
    private lastBounce: number = 0;
    constructor(private dbLength: number) {

    }
    pass(ignoreAndSet: boolean = false) {
        if (ignoreAndSet) {
            this.lastBounce = tick();
            return true;
        }
        if (tick() - this.lastBounce < this.dbLength) return false;
        
        this.lastBounce = tick();

        return true;
    }
}

export function createDebounce(bounceLength: number) {
    return new Debounce(bounceLength);
}