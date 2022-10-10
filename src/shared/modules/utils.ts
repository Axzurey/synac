import { UserInputService } from "@rbxts/services";

namespace utils {

    export function propertyExistsInObject<c extends any, p extends string, propType>(classlike: c, property: p): classlike is c & propertyExists<p, propType> {
        if (classlike[property as unknown as keyof typeof classlike]) return true;
        return false;
    }

    export function newThread<T extends (...args: never[]) => void>(callback: T, ...args: Parameters<T>) {
        coroutine.wrap(callback)(...args)
    }

    export function later(when: number, callback: () => void) {
        task.spawn(() => {
            task.wait(when);
            callback();
        })
    }

    export const random = new Random();

    export namespace ease {
        export function repeatThis(callback: (iteration: number) => void, times: number) {
            for (let i = 0; i < times; i++) {
                callback(times);
            }
        }
        export function repeatThisThreadEach(callback: (iteration: number) => void, times: number) {
            for (let i = 0; i < times; i++) {
                task.spawn(callback, i);
            }
        }
    }

	export namespace peripherals {
        export function isButtonDown(button: Enum.KeyCode | Enum.UserInputType) {
            if (button.EnumType === Enum.KeyCode) {
                return UserInputService.IsKeyDown(button as Enum.KeyCode)
            }
            else {
                return UserInputService.IsMouseButtonPressed(button as Enum.UserInputType)
            }
        }
    }

    export namespace dataTypeUtils {
        /**
         * returns a cframe position and orientation
         */
        export function cframeToCFrames(cframe: CFrame) {
            let o = cframe.ToOrientation()
            return [new CFrame(cframe.Position), CFrame.fromOrientation(o[0], o[1], o[2])];
        }
    }

    export namespace instanceUtils {
        /**
         * makes all children as if they aren't there(uninteractable)
         */
        export function nominalizeAllChildren(parent: Instance) {
            parent.GetChildren().forEach((v) => {
                if (v.IsA("BasePart")) {
                    v.CanCollide = false;
                    v.CanTouch = false;
                    v.CanQuery = false;
                }
            })
        }

        export function nominalizeAllDescendants(parent: Instance) {
            parent.GetDescendants().forEach((v) => {
                if (v.IsA("BasePart")) {
                    v.CanCollide = false;
                    v.CanTouch = false;
                    v.CanQuery = false;
                }
            })
        }

        export function unanchorAllChildren(parent: Instance) {
            parent.GetChildren().forEach((v) => {
                if (v.IsA("BasePart")) {
                    v.Anchored = false;
                }
            })
        }

        export function unanchorAllDescendants(parent: Instance) {
            parent.GetDescendants().forEach((v) => {
                if (v.IsA("BasePart")) {
                    v.Anchored = false;
                }
            })
        }
    }

    export namespace tableUtils {

		export function firstNumberRangeContainingNumber<T>(ranges: Map<NumberRange, T>, numberValue: number) {
            for (let [i, v] of ranges) {
                if (numberValue >= i.Min && numberValue <= i.Max) {
                    return v;
                }
            }
            return undefined;
		}

        export function rangeUpperClamp<T>(ranges: Map<NumberRange, T>) {
            let max: number | undefined = undefined;
            for (let [i, v] of ranges) {
                if (!max || i.Max >= max) {
                    max = i.Max;
                }
            }
            return max;
		}

        export function toMap<K, V>(keys: K[], values: V[]): Map<K, V> {
            let map: Map<K, V> = new Map();
            for (let i = 0; i < keys.size(); i++) {
                map.set(keys[i], values[i])
            };
            return map;
        }

        export function fillDefaults<T extends Record<any, any>>(passed: Partial<T>, fill: T): T {
            for (const [i, v] of pairs(fill)) {
                if (passed[i as keyof typeof passed]) {
                    continue;
                }
                else {
                    passed[i as keyof typeof passed] = v as any;
                }
            }
            return passed as T;
        }

        export function toArray<T extends Record<any, any>>(dictionary: T): ValueOf<T>[] {
            let a: ValueOf<T>[] = [];
    
            for (const [_, v] of pairs(dictionary)) {
                a.push(v as ValueOf<T>);
            }
            
            return a;
        }
    
        export function toKeysArray<T extends Record<any, any>>(dictionary: T): (keyof T)[] {
            let a: (keyof T)[] = [];
    
            for (const [v, _] of pairs(dictionary)) {
                a.push(v as keyof T);
            }
            
            return a;
        }

        export function partToPosition(parts: BasePart[]): Vector3[] {
            return parts.map((part) => {
                return part.Position
            });
        }
        
        export function firstKeyOfValue<V extends any, D extends Record<string, never>>(dictionary: D, value: V): keyof D | undefined {
            for (const [i, v] of pairs(dictionary)) {
                if (value === v) {
                    return i as keyof D;
                }
            }
            return;
        }
    }
}

export = utils;