import { RunService, Workspace } from "@rbxts/services";
import { timeStepInterpolationMode, useValue } from "shared/modules/chroni";
import { animateValue } from "shared/modules/colorful";

const v = useValue(new Vector3(0, 10, 0))

task.wait(3)

animateValue(v, [
    {time: 0, value: new Vector3(0, 10, 0), interpolationMode: timeStepInterpolationMode.linear},
    {time: 5, value: new Vector3(0, 0, 0), interpolationMode: timeStepInterpolationMode.linear},
    {time: 10, value: new Vector3(0, 15, 0), interpolationMode: timeStepInterpolationMode.linear}
])

const p = Workspace.FindFirstChild('p') as Part;

RunService.Heartbeat.Connect(() => {
    p.Position = v.getValue()
})
