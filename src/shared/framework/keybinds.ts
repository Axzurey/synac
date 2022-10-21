import { UserInputService } from "@rbxts/services";

type keybinding = 'fire' | 'reload' | 'firemode' | 'aim' | 'leanLeft' | 'leanRight' | 'crouch' | 'prone'

export class keybinds {
    constructor(private bindings: Record<keybinding, Enum.KeyCode | Enum.UserInputType>) {}

    getActionIsDown(action: keybinding): boolean {
        if (!this.bindings[action]) return false;

        let bind = this.bindings[action];

        if (bind.IsA('KeyCode')) {
            if (UserInputService.IsKeyDown(bind)) return true;
        }
        else {
            if (UserInputService.IsMouseButtonPressed(bind)) return true;
        }

        return false;
    }
    checkIsAction(action: keybinding, input: InputObject) {
        if (!this.bindings[action]) return false;

        let bind = this.bindings[action];

        if (bind.IsA('KeyCode')) {
            if (input.KeyCode === bind) return true;
        }
        else {
            if (input.UserInputType === bind) return true;
        }
        
        return false;
    }
    doKeyRaisedOnce(key: keybinding, callback: () => void): void {
        let bind = this.bindings[key];
        if (!bind) return;

        let c = UserInputService.InputEnded.Connect((input, gp) => {
            if (gp) return;

            if (bind.IsA('KeyCode')) {
                if (input.KeyCode === bind) {
                    c.Disconnect();
                    callback();
                }
            }
            else {
                if (input.UserInputType === bind) {
                    c.Disconnect();
                    callback();
                }
            }
        })
    }
}