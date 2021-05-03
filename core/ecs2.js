import { deepclone, nanoid, Log } from "./utils";

// =======================================
// World
// =======================================
export function newWorld(systems = [], addons = []) {
  return {
    addons,
    systems,
    entities: [],
  };
}
export function instantiateEntity(entity, world, defaultValues = null) {
  const newEntity = deepclone(entity);
  newEntity.id = nanoid();
  applyValuesToEntity(newEntity, defaultValues);
  world.entities.push(newEntity);
  return newEntity;
}
export function removeEntityFromWorld(entity, world) {
  if (world.entities.indexOf(entity) === -1)
    return Log("warn", "Cannot remove entity from world", entity);
  world.entities.splice(world.entities.indexOf(entity), 1);
}
export function addSystemToWorld(system, world) {
  world.systems.push(system);
}
export function initWorld(world) {
  for (let a = 0; a < world.addons.length; a++) {
    const addon = world.addons[a];
    if (addon.init) addon.init(world);
  }
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.init) system.init(world);
  }
}
export function updateWorld(world, time = 0) {
  for (let a = 0; a < world.addons.length; a++) {
    const addon = world.addons[a];
    if (addon.onBeforeUpdate) addon.onBeforeUpdate(world, time);
  }
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.update) system.update(world, time);
  }
  for (let a = 0; a < world.addons.length; a++) {
    const addon = world.addons[a];
    if (addon.onAfterUpdate) addon.onAfterUpdate(world, time);
  }
}
export function recoverWorld(world, newWorld) {
  world.entities = newWorld.entities;
  newWorld.addons.forEach((addon) => {
    const existingAddon = world.addons.find(
      (waddon) => waddon.name === addon.name
    );
    if (!existingAddon) {
      world.addon.push(addon);
    } else {
      for (const key in addon) {
        try {
          existingAddon[key] = addon[key];
        } catch {
          return Log(
            "warn",
            `Could not recover ${key} from addon ${addon.name}`,
            newWorld
          );
        }
      }
    }
  });
}

// =======================================
// Components
// =======================================
export function newComponent(name, data) {
  const component = {
    name,
    data,
  };
  return component;
}
export function addComponentToEntity(entity, component) {
  const name = component.name.toLowerCase();
  if (component.data) entity[name] = deepclone(component.data);
  entity.components.push(component.name);
  return entity;
}
export function removeComponentFromEntity(entity, component) {
  if (entity.components.indexOf(component.name) === -1) return;
  entity.components.splice(entity.components.indexOf(component.name), 1);
  if (!component.data) return;
  component.data.forEach((prop) => {
    delete entity[prop];
  });
}

// =======================================
// Entities
// =======================================
export function newEntity(name, components, defaultValues = {}) {
  let entity = {
    name: name,
    id: nanoid(),
    components: [],
  };
  for (let c = 0; c < components.length; c++) {
    const component = components[c];
    addComponentToEntity(entity, component);
  }
  applyValuesToEntity(entity, defaultValues);
  return entity;
}
export function queryEntities(world, components = []) {
  return components.length
    ? world.entities.filter((entity) =>
        components.every(
          (component) => entity.components.indexOf(component.name) >= 0
        )
      )
    : world.entities;
}
export function queryEntitiesByName(world, name) {
  return world.entities.find((entity) => entity.name === name);
}
export function queryEntityById(world, id) {
  return world.entities.find((entity) => entity.id === id);
}
export function applyValuesToEntity(entity, values) {
  if (!values || !Object.keys(values) || !Object.keys(values).length) return;
  for (const key in values) {
    if (entity[key]) entity[key] = values[key];
    else
      Log("warn", `Default values ${key} does not exist on ${entity}`, entity);
  }
}

// =======================================
// Systems
// =======================================
export function newSystem(name, init, update, world = null) {
  const system = {
    name,
    init,
    update,
  };
  if (world) addSystemToWorld(system, world);
  return system;
}
