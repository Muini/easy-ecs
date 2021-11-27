import { deepclone, nanoid, Log } from "./utils";

// =======================================
// World
// =======================================
export type WorldStaticData = {
  [key: string]: any;
};
export type World = {
  time: number;
  systems: System[];
  entities: Entity<any>[];
  data: WorldStaticData;
};
export function newWorld(systems: System[] = []): World {
  return {
    time: performance.now(),
    systems,
    entities: [],
    data: {},
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
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.init) system.init(world);
  }
}
export function updateWorld(world: World, time = 0) {
  const deltaTime = time - world.time;
  world.time = time;
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.beforeUpdate) system.beforeUpdate(world, deltaTime);
  }
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.update) system.update(world, deltaTime);
  }
  for (let s = 0; s < world.systems.length; s++) {
    const system = world.systems[s];
    if (system.afterUpdate) system.afterUpdate(world, deltaTime);
  }
}
export function recoverWorld(world: World, newWorld: World) {
  world.entities = newWorld.entities;
  world.time = performance.now();
  world.data = newWorld.data; //TODO: Overwrite only existing data
}

// =======================================
// Components
// =======================================
export interface Data {
  [key: string]: any;
}

export interface Component<D extends Data> {
  name: string;
  data: D;
}
export type ComponentList<D> = readonly Component<D>[];
export type ComponentProps<D extends Data> = {
  [N in keyof D]: D[N];
};
export type PartialComponentProps<D extends Partial<Data>> = Partial<{
  [N in keyof D]: D[N];
}>;

export function newComponent<D>(name: string, data: D): Component<D> {
  if (name === "name" || name === "id") {
    Log(
      "error",
      "'name' & 'id' are reserved name, you cannot use them as component names",
      name
    );
    return;
  }
  return { name, data } as Component<D>;
}
export function entityHasComponent(
  entity: Entity<any>,
  component: Component<any>
): boolean {
  return entity[component.name] !== undefined;
}
export function addComponentToEntity<List extends ComponentList<any>, N>(
  entity: Entity<List>,
  component: Component<N>
) {
  entity[component.name] = deepclone(component.data) ?? null;
  return entity as Entity<List>;
}
export function removeComponentFromEntity<List extends ComponentList<any>, R>(
  entity: Entity<List>,
  component: Component<R>
) {
  if (entityHasComponent(entity, component)) return;
  entity[component.name] = null;
  delete entity[component.name];
}

// =======================================
// Entities
// =======================================
interface EntityComponents<List extends ComponentList<any>> {
  [name: string]: ComponentProps<List[number]["data"]>;
}
interface PartialEntityComponents<List extends Partial<ComponentList<any>>> {
  [name: string]: PartialComponentProps<List[number]["data"]>;
}

export type Prefab<List extends ComponentList<any>> = {
  name: string;
  components: List;
  defaultValues?: PartialEntityComponents<List>;
};
export function newPrefab<List extends ComponentList<any>>(
  name: string,
  components: List,
  defaultValues?: PartialEntityComponents<List>
): Prefab<List> {
  return { name, components, defaultValues };
}

export type EntityId = string;
export type Entity<List extends ComponentList<any>> = {
  name: string;
  id: EntityId;
} & EntityComponents<List>;

export function newEntity<List extends ComponentList<any>>(
  prefab: Prefab<List>,
  world: World,
  defaultValues?: PartialEntityComponents<List>
) {
  let newEntity: Entity<List> = {
    name: prefab.name,
    id: nanoid() as EntityId,
  } as Entity<List>;
  for (let c = 0; c < prefab.components.length; c++) {
    const component = prefab.components[c];
    newEntity = addComponentToEntity(newEntity, component);
  }
  applyValuesToEntity(newEntity, defaultValues ?? prefab.defaultValues);
  world.entities.push(newEntity);
  return newEntity;
}
export type Query<
  H extends ComponentList<any>,
  N extends ComponentList<any>
> = {
  has?: H;
  not?: N;
};
export function queryEntities<
  H extends ComponentList<any>,
  N extends ComponentList<any>
>(world: World, query?: Query<H, N>): Entity<H>[] {
  const has = !!(query && query.has && query.has.length);
  const not = !!(query && query.not && query.not.length);

  enum QueryType {
    Has,
    Not,
    Both,
    None,
  }
  const queryType: QueryType =
    has && not
      ? QueryType.Both
      : has && !not
      ? QueryType.Has
      : not && !has
      ? QueryType.Not
      : QueryType.None;

  switch (queryType) {
    case QueryType.Both:
      return world.entities.filter(
        (entity) =>
          query.has.every((component: Component<H>) =>
            entityHasComponent(entity, component)
          ) &&
          query.not.every(
            (component: Component<N>) => !entityHasComponent(entity, component)
          )
      );
    case QueryType.Has:
      return world.entities.filter((entity) =>
        query.has.every((component: Component<H>) =>
          entityHasComponent(entity, component)
        )
      );
    case QueryType.Not:
      return world.entities.filter((entity) =>
        query.not.every(
          (component: Component<N>) => !entityHasComponent(entity, component)
        )
      );
    case QueryType.None:
    default:
      return world.entities;
  }
}
export function queryEntitiesByName(world: World, name: string): Entity<any>[] {
  return world.entities.filter((entity) => entity.name === name);
}
export function queryEntityById(world: World, id: EntityId) {
  return world.entities.find((entity) => entity.id === id);
}
export function applyValuesToEntity<List extends ComponentList<any>>(
  entity: Entity<List>,
  values: PartialEntityComponents<List>
) {
  if (!values || !Object.keys(values) || !Object.keys(values).length) return;
  for (const comp in values) {
    if (entity[comp]) {
      const compValues = values[comp];
      for (const key in compValues) {
        entity[comp][key] = compValues[key];
      }
    } else {
      Log(
        "warn",
        `Default values component ${comp} does not exist on ${entity.name}`,
        entity
      );
    }
  }
}

// =======================================
// Systems
// =======================================
export type SystemInit = (world: World) => void;
export type SystemUpdate = (world: World, dt: number) => void;
export type System = {
  name: string;
  init: SystemInit;
  update: SystemUpdate;
  beforeUpdate: SystemUpdate;
  afterUpdate: SystemUpdate;
};
export type SystemProps = {
  name: string;
  init?: SystemInit;
  update?: SystemUpdate;
  beforeUpdate?: SystemUpdate;
  afterUpdate?: SystemUpdate;
  world?: World;
};
export function newSystem(props: SystemProps): System {
  const system: System = {
    name: props.name,
    init: props.init,
    update: props.update,
    beforeUpdate: props.beforeUpdate,
    afterUpdate: props.afterUpdate,
  };
  if (props.world) addSystemToWorld(system, props.world);
  return system;
}
