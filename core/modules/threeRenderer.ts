import {
  Entity,
  entityHasComponent,
  newComponent,
  newEntity,
  newSystem,
  queryEntities,
  World,
} from "../ecs";
import {
  Object3D,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
  ACESFilmicToneMapping,
  PerspectiveCamera,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ========================
// Initial setup
// ========================

// Store all objects into a map that is built on load
export const RendererObjects = new Map<string, Object3D>();
// export const RendererMaterials = new Map<EntityId, MeshBasicMaterial>();

export function newRenderer(container = document.body) {
  const renderer = new WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance",
    alpha: false,
  });
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.physicallyCorrectLights = true;
  renderer.gammaFactor = 2.2;

  container.appendChild(renderer.domElement);

  return renderer;
}

export function setRendererSize(
  renderer: WebGLRenderer,
  world: World,
  container = document.body,
  pixelDensity = devicePixelRatio,
  fixedRatio: number = null
) {
  let width = window.innerWidth;
  let height;
  if (fixedRatio !== null) {
    height = width / fixedRatio;
    if (window.innerHeight < height) {
      height = window.innerHeight;
      width = height * fixedRatio;
    }
  } else {
    height = window.innerHeight;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelDensity);

  container.style["width"] = `${width}px`;
  container.style["height"] = `${height}px`;

  const camera = getCamera(world);
  if (camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  /*if (this.hasPostProd)
    this.postprod.resize(this.width, this.height, this.pixelDensity);*/
}

export function newScene() {
  return new Scene();
}

// ========================
// Components
// ========================

export const Object3DComponent = newComponent("object", {
  name: "",
  id: "",
});
export const MeshComponent = newComponent("mesh");
export const LightComponent = newComponent("light");
export const MaterialComponent = newComponent("material");
export const CameraComponent = newComponent("camera");

// ========================
// Systems
// ========================

export const RendererObjectsSyncSystem = newSystem({
  name: "renderer-objects-sync",
  afterUpdate: (world, dt) => {
    const addedEntities = world.flags.lastAddedEntities;
    addedEntities.forEach((entity) => {
      const obj = getObject(entity);
      if (obj) {
        obj.visible = true;
      }
    });
    const removedEntities = world.flags.lastRemovedEntities;
    removedEntities.forEach((entity) => {
      const obj = getObject(entity);
      if (obj) {
        obj.visible = false;
      }
    });
  },
});

// ========================
// Utils
// ========================

export function getCamera(world: World) {
  const cameraEntity = queryEntities(world, {
    has: [Object3DComponent, CameraComponent],
  })[0];
  if (!cameraEntity) return console.warn("no camera entity found");
  const camera = RendererObjects.get(cameraEntity.object.id);
  if (!camera) return console.warn("no camera object found");
  return camera as PerspectiveCamera;
}

export function getObject(entity: Entity<typeof Object3DComponent>) {
  if (!entityHasComponent(entity, Object3DComponent)) return;
  const obj = RendererObjects.get(entity.object.id);
  return obj;
}

const loader = new GLTFLoader();
export function importGLTF(
  path: string,
  onProcessed: (gltf, entities: Entity<any>) => void
) {
  console.log("importGLTF", path);
  loader.load(
    path,
    (gltf) => {
      console.log("GLTF Loaded !", gltf);
      const entities: Entity<any>[] = processGLTF(gltf);
      onProcessed?.(gltf, entities);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      throw new Error("GLTF Loader error");
    }
  );
}

export function processGLTF(gltf): Entity<any>[] {
  const entities: Entity<any> = [];

  const parseObject = (obj: Object3D) => {
    let newEnt;
    switch (obj.type) {
      case "Object3D":
      case "Group":
        console.log("create obj", obj);
        newEnt = newEntity(obj.name, [Object3DComponent], {
          object: {
            name: obj.name,
            id: obj.uuid,
          },
        });
        break;
      case "Mesh":
        newEnt = newEntity(obj.name, [Object3DComponent, MeshComponent], {
          object: {
            name: obj.name,
            id: obj.uuid,
          },
        });
        break;

      case "PerspectiveCamera":
        newEnt = newEntity(obj.name, [Object3DComponent, CameraComponent], {
          object: {
            name: obj.name,
            id: obj.uuid,
          },
        });
        break;

      default:
        break;
    }
    //Found a valid obj
    if (newEnt) {
      RendererObjects.set(obj.uuid, obj);
      entities.push(newEnt);
    }
    //Check for children
    if (obj.children && obj.children.length) {
      obj.children.forEach((child) => parseObject(child));
    }
  };

  parseObject(gltf.scene);

  console.log(entities, RendererObjects);

  return entities;
}
