import { deepclone, nanoid, Log } from "./utils";

// =======================================
// World
// =======================================
export type World = {
  time: number;
  addons: any;
  systems: System[];
  entities: Entity<any>[];
};
export function newWorld(systems: System[] = [], addons = []): World {
  return {
    time: performance.now(),
    addons,
    systems,
    entities: [],
  };
}
export function removeEntityFromWorld(entity: Entity<any>, world: World) {
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
export type ComponentData = {
  [key: string]: any;
}
export type Component<D extends ComponentData> {
  name: string;
  data: D;
}
type ComponentProps<C extends Component<any>> = {
  [P in keyof C["data"]]: C["data"][P];
};
type PartialComponentProps<C extends Component<any>> = Partial<
  ComponentProps<C>
>;

export function newComponent<D extends ComponentData>(
  name: string,
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
>(entity: Entity<C>, component: newC) {
  const name = component.name;
  const data = component.data as ComponentProps<newC>;
  if (data) {
    entity[name] = deepclone(data);
  }
  entity.components.push(component.name);
  return entity as Entity<C & newC>;
}
export function removeComponentFromEntity<D>(
  entity: Entity<any>,
  component: Component<D>
) {
  if (entity.components.indexOf(component.name) === -1) return;
  entity.components.splice(entity.components.indexOf(component.name), 1);
  if (!component.data) return;
  const name = component.name;
  delete entity[name];
}

// =======================================
// Entities
// =======================================
export type Prefab<C extends Component<any>> = {
  name: string;
  components: C[];
  defaultValues?: PartialEntityProps<C>;
};
export type EntityId = string;

type EntityProps<C extends Component<any>> = {
  [key: string]: ComponentProps<C>;
};
type PartialEntityProps<C extends Component<any>> = Partial<{
  [key: string]: PartialComponentProps<C>;
}>;
type UpdateType<T> = {
  [P in keyof T as `set${Capitalize<string & P>}`]: (key: T[P], item: T) => T;
}

export type Entity<C extends Component<any>> = {
  name: string;
  id: EntityId;
  components: string[];
} & EntityProps<C>;
export function newPrefab<C extends Component<any>>(
  name: string,
  components: C[],
  defaultValues?: PartialEntityProps<C>
): Prefab<C> {
  return { name, components, defaultValues };
}
export function newEntity<C extends Component<any>>(
  prefab: Prefab<C>,
  world: World,
  defaultValues?: PartialEntityProps<C>
) {
  let newEntity: Entity<C> = {
    name: prefab.name,
    id: nanoid() as EntityId,
    components: [],
  } as Entity<C>;
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
  values: PartialEntityProps<C>
) {
  if (!values || !Object.keys(values) || !Object.keys(values).length) return;
  for (const key in values) {
    if (entity[key]) entity[key] = values[key] as ComponentProps<C>;
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
