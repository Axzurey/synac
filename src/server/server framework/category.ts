namespace category {
    const headNames = ['Head'];
    const bodyNames = ['UpperTorso', 'LowerTorso'];
    const limbNames = [
        'RightUpperArm', 'RightLowerArm', 'RightHand',
        'LeftUpperArm', 'LeftLowerArm', 'LeftHand',
        'LeftUpperLeg', 'LeftLowerLeg', 'LeftFoot',
        'RightUpperLeg', 'RightLowerLeg', 'RightFoot'
    ];

    type BodyPart = 'limb' | 'head' | 'body'

    export function getBodyPart(name: string): BodyPart | undefined {
        if (headNames.indexOf(name) !== -1) return 'head';
        if (bodyNames.indexOf(name) !== -1) return 'body';
        if (bodyNames.indexOf(name) !== -1) return 'limb';
    }
}

export = category;