import { Workspace } from "@rbxts/services";
import mesh from "shared/osiris engine/modules/mesh";
import { Entity } from "./entity";

namespace nylon {

    type HitboxFunction = (hit: BasePart) => boolean;

    interface ZoneHitBuffer {
        precise: BasePart
    }

    type IsInZoneFunction = (vertexMesh: mesh) => ZoneHitBuffer | false;

    /**
        returns a function which can be used to test if an object hit by a nylon raycast belongs to this entity 
        The conditions are as follows
        + The hit instance must be a basepart
        + The hit instance must not have a transparency of 1
     */
    export function getHitSearchShallow<T extends Entity>(entity: T): HitboxFunction {
        return (hit: BasePart) => {
            if (!entity.vessel) return false;
            for (let v of entity.vessel.GetChildren()) {
                if (v.IsA('BasePart') && v.Transparency !== 1 && v === hit) return true;
            }
            return false;
        }
    }

    export function isInZoneSearchCenter<T extends Entity>(entity: T): IsInZoneFunction {
        return (vertexMesh) => {
            if (!entity.vessel) return false;
            for (let v of entity.vessel.GetChildren()) {
                if (v.IsA('BasePart') && v.Transparency !== 1 && vertexMesh.isPointInside(v.Position)) {
                    return {
                        precise: v
                    }
                }
            }
            return false;
        }
    }

    interface EntityBuffer {
        entity: Entity,
        searchHit: HitboxFunction,
        isInZone: IsInZoneFunction
    }

    const entities: EntityBuffer[] = [];

    interface NylonRaycastParams {
        origin: Vector3,
        direction: Vector3,
        magnitude: number,
        exclude?: Entity[] | ((e: Entity) => boolean),
        excludeDescendants?: Instance[] | ((hit: BasePart) => boolean)
    }

    interface NylonRaycastResultNoBuff {
        position: Vector3,
        normal: Vector3,
        material: Enum.Material,
        instance: BasePart,
        isEntity: false
    }

    interface NylonRaycastResult {
        position: Vector3,
        normal: Vector3,
        material: Enum.Material,
        instance: BasePart,
        entityBuffer: EntityBuffer,
        isEntity: true
    }

    function getFirstEntityBufferWhichInstanceBelongsTo(i: Instance, exclude?: Entity[]): EntityBuffer | undefined {
        for (let entity of entities) {
            if (entity.entity.vessel && i.IsDescendantOf(entity.entity.vessel)) {
                if (exclude && exclude.indexOf(entity.entity) !== -1) continue;
                return entity;
            }
        }
    }

    function recurseQueryCast(params: NylonRaycastParams, ignore: BasePart[], ignoreEntities: Entity[]): NylonRaycastResult | NylonRaycastResultNoBuff | undefined {
        let pm = new RaycastParams();
        pm.FilterDescendantsInstances = ignore

        let result = Workspace.Raycast(params.origin, params.direction.mul(params.magnitude), pm);

        if (!result) return;

        if (params.excludeDescendants) {
            if (typeIs(params.excludeDescendants, 'function')) {
                if (params.excludeDescendants(result.Instance)) {
                    ignore.push(result.Instance);
                    return recurseQueryCast(params, ignore, ignoreEntities)
                }
            }
            else {
                for (let p of params.excludeDescendants) {
                    if (result.Instance.IsDescendantOf(p)) {
                        ignore.push(result.Instance)
                        return recurseQueryCast(params, ignore, ignoreEntities)
                    };
                }
            }
        }

        let entityBuffer = getFirstEntityBufferWhichInstanceBelongsTo(result.Instance);

        if (!entityBuffer) return {
            instance: result.Instance,
            position: result.Position,
            material: result.Material,
            normal: result.Normal,
            isEntity: false
        };

        if (params.exclude && typeIs(params.exclude, 'function')) {
            if (params.exclude(entityBuffer.entity)) {
                ignoreEntities.push(entityBuffer.entity);
                return recurseQueryCast(params, ignore, ignoreEntities)
            } 
        }
        else if (params.exclude && typeIs(params.exclude, 'table')) {
            if (params.exclude.indexOf(entityBuffer.entity) !== -1) {
                ignoreEntities.push(entityBuffer.entity);
                return recurseQueryCast(params, ignore, ignoreEntities);
            }
        }

        return {
            entityBuffer: entityBuffer,
            instance: result.Instance,
            position: result.Position,
            normal: result.Normal,
            material: result.Material,
            isEntity: true
        };
    }

    export function queryRaycast(params: NylonRaycastParams) {
        return recurseQueryCast(params, [], []);
    }

    /**
     * creates an entity into the world
     * hitbox is an optional param if you want to change how the system checks if an entity is hit. by default this is 
     * getHitSearchAll
     */
    export function createEntity<T extends Entity>(
        entity: T,
        hitbox: HitboxFunction = getHitSearchShallow(entity),
        isInZone: IsInZoneFunction = isInZoneSearchCenter(entity)) 
    {
        const buffer: EntityBuffer = {
            entity: entity,
            searchHit: hitbox,
            isInZone: isInZone
        }

        entities.push(buffer);
    }
}

export = nylon;