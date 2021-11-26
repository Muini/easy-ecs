import { EntityId, newComponent } from "../ecs";

export const Parent = newComponent("parent", {
  id: null as EntityId,
});
