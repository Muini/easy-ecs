import {
  Entity,
  EntityId,
  newComponent,
  newEntity,
  cloneEntity,
  newSystem,
  queryEntities,
  World,
} from "../ecs";
import {
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
  ACESFilmicToneMapping,
  Vector3,
  Euler,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ========================
// Initial setup
// ========================

// Store all objects into a map that is built on load
export const RendererObjects = new Map<string, Object3D>();
// export const RendererMaterials = new Map<EntityId, MeshBasicMaterial>();

export const Renderer = new WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance",
  alpha: false,
});
Renderer.outputEncoding = sRGBEncoding;
Renderer.toneMapping = ACESFilmicToneMapping;
Renderer.physicallyCorrectLights = true;
Renderer.gammaFactor = 2.2;

export const scene = new Scene();

// ========================
// Components
// ========================

export const TransformComponent = newComponent("transform", {
  position: new Vector3(),
  rotation: new Euler(),
  scale: new Vector3(),
});

export const CameraComponent = newComponent("camera", "");

export const Material = newComponent("material", "");

export const Mesh = newComponent("material", "");

// ========================
// Systems
// ========================

// ========================
// Utils
// ========================

const loader = new GLTFLoader();
export function importGLTF(path: string) {
  console.log("importGLTF", path);
  loader.load(
    path,
    (gltf) => {
      console.log("GLTF Loaded !", gltf);
      processGLTF(gltf);
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
        newEnt = newEntity(obj.name, [TransformComponent], {
          transform: {
            position: obj.position,
            rotation: obj.rotation,
            scale: obj.scale,
          },
        });
        break;
      case "Mesh":
        break;

      case "PerspectiveCamera":
        newEnt = newEntity(obj.name, [TransformComponent, CameraComponent], {
          camera: obj.uuid,
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
