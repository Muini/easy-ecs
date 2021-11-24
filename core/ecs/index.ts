import { deepclone, nanoid, Log } from "./utils";

// =======================================
// World
// =======================================
export type World = {
  time: number;
  addons: any;
  systems: System[];
  entities: Entity[];
};
export function newWorld(systems: System[] = [], addons = []): World {
  return {
    time: performance.now(),
    addons,
    systems,
    entities: [],
  };
}
export function removeEntityFromWorld(entity: Entity, world: World) {
  if (world.entities.indexOf(entity) === -1)
    return Log("warn", "Cannot remove entity from world", entity);
  world.entities.splice(world.entities.indexOf(entity), 1);
}
export function addSystemToWorld(system: System, world: World) {
  world.systems.push(system);
}
export function removeSystemFromWorld(system: System, world: World) {
  world.systems.splice(world.systems.indexOf(system), 1);
}
export function initWorld(world: World) {
  world.time = performance.now();
  for (let a = 0; a < world.addons.length; a++) {
    const addon = world.addons[a];
    if (addon.init) addon.init(world);
  }
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.init) system.init(world);
  }
}
export function updateWorld(world: World, time = 0) {
  const deltaTime = time - world.time;
  world.time = time;
  for (let a = 0; a < world.addons.length; a++) {
    const addon = world.addons[a];
    if (addon.onBeforeUpdate) addon.onBeforeUpdate(world, deltaTime);
  }
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.update) system.update(world, deltaTime);
  }
  for (let a = 0; a < world.addons.length; a++) {
    const addon = world.addons[a];
    if (addon.onAfterUpdate) addon.onAfterUpdate(world, deltaTime);
  }
}
export function recoverWorld(world: World, newWorld: World) {
  world.entities = newWorld.entities;
  world.time = performance.now();
  newWorld.addons.forEach((addon) => {
    const existingAddon = world.addons.find(
      (waddon) => waddon.name === addon.name
    );
    if (!existingAddon) {
      world.addons.push(addon);
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
export type ComponentName = string;
export interface ComponentData {
  [key: string]: any;
}
export type Component<D extends ComponentData> = {
  name: ComponentName;
  data: D;
};

export function newComponent<D extends ComponentData>(
  name: ComponentName,
  data?: D
): Component<D> {
  return {
    name,
    data,
  };
}
export function addComponentToEntity<
  C extends Component<any>,
  newC extends Component<any>
>(entity: Entity<C>, component: newC): Entity<C | newC> {
  const name = component.name.toLowerCase();
  if (component.data) entity[name] = deepclone(component.data);
  entity.components.push(component.name);
  return entity;
}
export function removeComponentFromEntity<D>(
  entity: Entity<any>,
  component: Component<D>
) {
  if (entity.components.indexOf(component.name) === -1) return;
  entity.components.splice(entity.components.indexOf(component.name), 1);
  if (!component.data) return;
  const name = component.name.toLowerCase();
  delete entity[name];
}

// =======================================
// Entities
// =======================================
export type Prefab<C extends Component<any>> = {
  name: string;
  components: C[];
  defaultValues?: Partial<C["data"]>;
};
export type EntityId = string;

export interface Entity<C extends Component<any>> {
  name: string;
  id: EntityId;
  components: C["name"][];
  // [key: ComponentName]: Partial<C["data"]>;
}
export function newPrefab<C extends Component<any>>(
  name: string,
  components: C[],
  defaultValues?: Partial<C["data"]>
): Prefab<C> {
  return { name, components, defaultValues };
}
export function newEntity<
  C extends P["components"][number],
  P extends Prefab<any>
>(prefab: P, world: World, defaultValues?: P["defaultValues"]): Entity<C> {
  const newEntity: Entity<C> = {
    name: prefab.name,
    id: nanoid() as EntityId,
    components: [],
  };
  for (let c = 0; c < prefab.components.length; c++) {
    const component = prefab.components[c];
    addComponentToEntity(newEntity, component);
  }
  applyValuesToEntity(newEntity, defaultValues);
  world.entities.push(newEntity);
  return newEntity;
}
export type Query<C extends Component<any>> = {
  has?: C[];
  not?: C[];
};
export function queryEntities<C extends Component<any>>(
  world: World,
  query: Query<C>
): Entity<C>[] {
  return query.has.length
    ? world.entities.filter((entity) =>
        query.has.every(
          <T>(component: Component<T>) =>
            entity.components.indexOf(component.name) >= 0
        )
      )
    : world.entities;
}
export function queryEntitiesByName(world: World, name: string): Entity<any>[] {
  return world.entities.filter((entity) => entity.name === name);
}
export function queryEntityById(world: World, id: EntityId) {
  return world.entities.find((entity) => entity.id === id);
}
export function applyValuesToEntity<C extends Component<any>>(
  entity: Entity<C>,
  values: Partial<C["data"]>
) {
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
export type System = {
  name: string;
  init: (world: World) => void;
  update: (world: World, dt: number) => void;
};
export function newSystem(
  name: string,
  init: (world: World) => void,
  update: (world: World, dt: number) => void,
  world?: World
): System {
  const system: System = {
    name,
    init,
    update,
  };
  if (world) addSystemToWorld(system, world);
  return system;
}
