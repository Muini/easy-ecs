import { initWorld, newEntity, newWorld, updateWorld } from "../core/ecs";

import { Loop } from "../core/modules/loop";
import { SaveSystem } from "../core/modules/saveSystem";
import { initSceneModule, prefabScene } from "../core/modules/scene";
import { Renderer, importGLTF } from "../core/modules/threeRenderer";

const world = newWorld();

initSceneModule(world);

const hexScene = newEntity(prefabScene, world, {
  name: "scene-hex",
  scene: { isActive: true, entities: [] },
});

importGLTF("./assets/hex.glb");

// Init & Start loop
initWorld(world);

Loop.update = (time: number) => {
  updateWorld(world, time);
};
Loop.start();

console.log(Renderer);
console.log(world);
