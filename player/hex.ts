import {
  addEntityToWorld,
  initWorld,
  newWorld,
  updateWorld,
} from "../core/ecs";

import { Loop } from "../core/modules/loop";
// import { SaveSystem } from "../core/modules/saveSystem";
// import { initSceneModule, prefabScene } from "../core/modules/scene";
import {
  newRenderer,
  importGLTF,
  newScene,
  RendererObjectsSyncSystem,
  setRendererSize,
  getCamera,
} from "../core/modules/threeRenderer";

const world = newWorld([RendererObjectsSyncSystem]);

const renderer = newRenderer();

const scene = newScene();

setRendererSize(renderer, world);

// initSceneModule(world);

/*const hexScene = newEntity(prefabScene, world, {
  name: "scene-hex",
  scene: { isActive: true, entities: [] },
});*/

importGLTF("./hex.glb", (gltf, entities) => {
  entities.forEach((entity) => {
    addEntityToWorld(entity, world);
  });
  scene.add(gltf.scene);
  onLoaded();
});

const onLoaded = () => {
  // Init & Start loop
  initWorld(world);

  Loop.update = (time: number) => {
    updateWorld(world, time);
    //Retrieve camera
    const camera = getCamera(world);
    if (camera) renderer.render(scene, camera);
  };
  Loop.start();

  console.log("start loop", renderer, world);
};

window.addEventListener("resize", () => {
  setRendererSize(renderer, world);
});
