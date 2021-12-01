import {
  Entity,
  EntityId,
  newComponent,
  newSystem,
  queryEntities,
  World,
} from "../ecs";
import { Object3D, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ========================
// Initial setup
// ========================

// Store all objects into a map that is built on load
export const RendererObjects = new Map<EntityId, Object3D>();
// export const RendererMaterials = new Map<EntityId, MeshBasicMaterial>();

export const Renderer = new WebGLRenderer();

export const scene = new Scene();
console.log(scene, GLTFLoader);

const loader = new GLTFLoader();
export function importGLTF(path: string) {
  loader.load(
    path,
    (data) => {
      console.log("GLTF Loaded !", data);
    },
    () => {
      console.log("progress");
    }
  );
}

// ========================
// Components
// ========================

export const CameraComponent = newComponent("camera", {
  focalLength: 75,
  near: 0.1,
  far: 1000,
});
function updateCameraProps(entity: Entity<typeof CameraComponent>) {
  const { focalLength, near, far } = entity.camera;
  let camera = RendererObjects.get(entity.id) as PerspectiveCamera;
  if (!camera) {
    const size = Renderer.getSize();
    camera = new PerspectiveCamera(
      focalLength,
      size.width / size.height,
      near,
      far
    );
    RendererObjects.set(entity.id, camera);
  }
  camera.setFocalLength(focalLength);
  camera.near = near;
  camera.far = far;
}

export const Material = newComponent("material", {});

// ========================
// Systems
// ========================

function updateAllObjects(world: World) {
  //Cameras
  const cameras = queryEntities(world, { has: [CameraComponent] });
  cameras.forEach((camera) => updateCameraProps(camera));
}

export const UpdateRendererObjects = newSystem({
  name: "update-renderer-objects",
  init: (world) => {
    updateAllObjects(world);
  },
  beforeUpdate: (world, dt) => {
    updateAllObjects(world);
  },
});
