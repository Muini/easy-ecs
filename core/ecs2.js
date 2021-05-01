import { deepclone } from "./utils";

// =======================================
// World
// =======================================
export function newWorld(addons = []) {
  return {
    components: [],
    addons,
    systems: [],
    entities: [],
  };
}
export function addEntityToWorld(entity, world) {
  world.entities.push(entity);
}
export function removeEntityFromWorld(entity, world) {
  if (world.entities.indexOf(entity) === -1)
    return console.warn("Easy-ECS: Cannot remove entity from world", entity);
  world.entities.splice(world.entities.indexOf(entity), 1);
}
export function addComponentToWorld(component, world) {
  world.components.push(component);
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

// =======================================
// Components
// =======================================
export function newComponent(name, data, world = null) {
  const component = {
    name,
    data,
  };
  if (world) addComponentToWorld(component, world);
  return component;
}
export function addComponentToEntity(entity, component) {
  entity[component.name] = deepclone(component.data);
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
export function newEntity(components, defaultValues = {}, world = null) {
  let entity = {
    id: Date.now(),
    components: [],
  };
  for (let c = 0; c < components.length; c++) {
    const component = components[c];
    addComponentToEntity(entity, component);
  }
  if (Object.keys(defaultValues).length) {
    for (const key in defaultValues) {
      entity[key] = defaultValues[key];
    }
  }
  if (world) addEntityToWorld(entity, world);
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
export function queryEntityById(world, id) {
  return world.entities.find((entity) => entity.id === id);
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
