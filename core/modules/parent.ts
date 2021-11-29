import { Entity, EntityId, newComponent } from "../ecs";

export const Parent = newComponent("parent", {
  id: null as EntityId,
});

export function setParent(
  entity: Entity<typeof Parent>,
  parent: Entity<unknown>
) {
  entity.parent.id = parent.id;
}
export function clearParent(entity: Entity<typeof Parent>) {
  entity.parent.id = null;
}
