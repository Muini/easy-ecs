import {
  addEntityToWorld,
  addSystemToWorld,
  Entity,
  EntityId,
  newComponent,
  newEntity,
  newPrefab,
  newSystem,
  queryEntities,
  queryEntityById,
  removeEntityFromWorld,
  World,
} from "../ecs";
import { Log } from "../ecs/utils";

export const Scene = newComponent("scene", {
  isActive: false,
  entities: [] as Entity<any>[],
});
const SceneStorageComponent = newComponent("scenestorage", {
  activeSceneId: "" as EntityId,
  entities: [] as Entity<any>[],
});
const prefabSceneManager = newPrefab("SceneManager", [SceneStorageComponent]);
export const SceneManager = newEntity(prefabSceneManager, null, {
  scenestorage: { activeSceneId: "", entities: [] },
});

export const prefabScene = newPrefab("scene", [Scene]);

function addEntityToScene(
  entity: Entity<any>,
  escene: Entity<typeof Scene>,
  world: World
) {
  removeEntityFromWorld(entity, world);
  escene.scene.entities.push(entity);
}
function removeEntityFromScene(
  entity: Entity<any>,
  escene: Entity<typeof Scene>,
  world: World
) {
  if (escene.scene.entities.indexOf(entity) === -1) return;
  escene.scene.entities.splice(escene.scene.entities.indexOf(entity), 1);
  addEntityToWorld(entity, world);
}

export function initSceneModule(world: World) {
  addEntityToWorld(SceneManager, world);
  addSystemToWorld(SceneManagerSystem, world);
}
export function setActiveScene(escene: Entity<typeof Scene>, world: World) {
  const scenes = queryEntities(world, { has: [Scene] });
  scenes.forEach((ent) => {
    ent.scene.isActive = ent.id === escene.id ? true : false;
  });
}

export const SceneManagerSystem = newSystem({
  name: "scene-manager",
  init: (world: World) => {
    const manager = queryEntityById(
      world,
      SceneManager.id
    ) as typeof SceneManager;
    if (!manager)
      return Log("error", "SceneManager entity not found in world", world);

    const entities = queryEntities(world, {
      not: [Scene, SceneStorageComponent],
    });
    manager.scenestorage.entities = [].concat(entities);

    entities.forEach((entity) => {
      removeEntityFromWorld(entity, world);
    });
  },
  beforeUpdate: (world: World, dt: number) => {
    const manager = queryEntityById(
      world,
      SceneManager.id
    ) as typeof SceneManager;
    if (!manager) return;

    const scenes = queryEntities(world, { has: [Scene] });
    const activeScene = scenes.find((ent) => ent.scene.isActive);
    if (!activeScene) return;
    if (manager.scenestorage.activeSceneId === activeScene.id) return;

    const entities = queryEntities(world, { not: [Scene] });
    const prevScene = queryEntityById(
      world,
      manager.scenestorage.activeSceneId
    ) as Entity<typeof Scene>;

    entities.forEach((entity) => {
      if (prevScene) removeEntityFromScene(entity, prevScene, world);
      addEntityToScene(entity, activeScene, world);
    });
    manager.scenestorage.activeSceneId = activeScene.id;
  },
});
