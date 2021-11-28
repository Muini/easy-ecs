import {
  newComponent,
  Component,
  newSystem,
  World,
  queryEntities,
  Entity,
  entityHasComponent,
} from "../ecs";

export type Keyframe = {
  time: number;
  value: Component<any, any>;
  easing: [number, number, number, number, number];
};
export const Keyframes = newComponent("keyframes", [] as Keyframe[]);

export const KeyframesSystem = newSystem({
  name: "keyframes-manager",
  update: (world: World, dt: number) => {
    const entities = queryEntities(world, { has: [Keyframes] });
    entities.forEach((entity) => {
      entity.keyframes.forEach((keyframe) => {
        //TODO: interpolate and set value
      });
    });
  },
});

export function addKeyframe(entity: Entity<unknown>, keyframe: Keyframe) {
  if (entityHasComponent(entity, Keyframes)) {
    (entity as Entity<typeof Keyframes>).keyframes.push(keyframe);
  }
}
