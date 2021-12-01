import { deepclone, nanoid, Log } from "./utils";

// =======================================
// World
// =======================================
export type WorldStaticData = {
  [key: string]: any;
};
export type WorldFlags = {
  entityListDirty: boolean;
  entityComponentsDirty: boolean;
  systemsDirty: boolean;
};
export type World = {
  time: number;
  systems: System<any>[];
  entities: Entity<any>[];
  data: WorldStaticData;
  flags: WorldFlags;
};
export function newWorld(systems: System<any>[] = []): World {
  return {
    time: performance.now(),
    systems,
    entities: [],
    data: {},
    flags: {
      entityListDirty: false,
      entityComponentsDirty: false,
      systemsDirty: false,
    },
  };
}
export function addEntityToWorld(entity: Entity<any>, world: World) {
  world.entities.push(entity);
  world.flags.entityListDirty = true;
}
export function removeEntityFromWorld(entity: Entity<any>, world: World) {
  if (world.entities.indexOf(entity) === -1)
    return Log("warn", "Cannot remove entity from world", entity);
  world.entities.splice(world.entities.indexOf(entity), 1);
  world.flags.entityListDirty = true;
}
export function addSystemToWorld(system: System<any>, world: World) {
  world.systems.push(system);
  world.flags.systemsDirty = true;
}
export function removeSystemFromWorld(system: System<any>, world: World) {
  world.systems.splice(world.systems.indexOf(system), 1);
  world.flags.systemsDirty = true;
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

  world.flags.entityListDirty = false;
  world.flags.entityComponentsDirty = false;
  world.flags.systemsDirty = false;
}
export function recoverWorld(world: World, newWorld: World) {
  world.entities = newWorld.entities;
  world.time = performance.now();
  world.data = newWorld.data; //TODO: Overwrite only existing data
  world.flags.entityListDirty = true;
  world.flags.entityComponentsDirty = true;
  world.flags.systemsDirty = true;
}

// =======================================
// Components
// =======================================
export type Component<N extends string, D> = Record<N, D>;

export function newComponent<N extends string, D>(name: N, data: D = null) {
  return { [name.toLowerCase()]: data } as Component<Lowercase<N>, D>;
}
export function entityHasComponent(
  entity: Entity<unknown>,
  component: Component<any, any>
): boolean {
  for (const cname in component) return entity[cname] !== undefined;
}
export function addComponentToEntity<
  C extends Component<any, any>,
  N extends Component<any, any>
>(entity: Entity<C>, component: N, world: World) {
  const obj = Object.assign(entity, deepclone(component));
  world.flags.entityComponentsDirty = true;
  return entity as Entity<typeof obj>;
}
export function removeComponentFromEntity<
  C extends Component<any, any>,
  R extends Component<any, any>
>(entity: Entity<C>, component: R, world: World) {
  if (!entityHasComponent(entity, component)) return;
  world.flags.entityComponentsDirty = true;
  for (const cname in component) delete entity[cname];
}

// =======================================
// Entities
// =======================================

export type Prefab<C extends Component<any, any>> = {
  readonly name: string;
  readonly components: C[];
  readonly defaultValues?: Partial<C>;
};
export function newPrefab<C extends Component<any, any>>(
  name: string,
  components: C[],
  defaultValues?: Partial<C>
): Prefab<C> {
  return { name, components, defaultValues };
}

export type EntityId = string;
export type Entity<C extends Component<any, any>> = {
  readonly name: string;
  readonly id: EntityId;
} & C;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
export function newEntity<C extends Component<any, any>>(
  prefab: Prefab<C>,
  world?: World,
  defaultValues?: Partial<Omit<Entity<C>, "id">>
) {
  let components = {} as UnionToIntersection<C>;
  for (const key in prefab.components) {
    Object.assign(components, deepclone(prefab.components[key]));
  }
  const obj = Object.assign({ name: prefab.name, id: nanoid() }, components);
  const newEntity = obj as Entity<typeof obj>;
  applyValuesToEntity(
    newEntity,
    (defaultValues as any) ?? prefab.defaultValues
  );
  if (world) addEntityToWorld(newEntity, world);
  return newEntity;
}
export type Query<
  H extends Component<any, any>[],
  N extends Component<any, any>[]
> = {
  has?: H;
  not?: N;
};
export function queryEntities<
  H extends Component<any, any>[],
  N extends Component<any, any>[]
>(world: World, query?: Query<H, N>): Entity<UnionToIntersection<H[number]>>[] {
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
          query.has.every((component) =>
            entityHasComponent(entity, component)
          ) &&
          query.not.every((component) => !entityHasComponent(entity, component))
      );
    case QueryType.Has:
      return world.entities.filter((entity) =>
        query.has.every((component) => entityHasComponent(entity, component))
      );
    case QueryType.Not:
      return world.entities.filter((entity) =>
        query.not.every((component) => !entityHasComponent(entity, component))
      );
    case QueryType.None:
    default:
      return world.entities;
  }
}
export function queryEntitiesByName(
  world: World,
  name: string
): Entity<unknown>[] {
  return world.entities.filter((entity) => entity.name === name);
}
export function queryEntityById(world: World, id: EntityId) {
  const entity = world.entities.find((entity) => entity.id === id);
  return entity as Entity<typeof entity>;
}
export function applyValuesToEntity<C extends Component<any, any>>(
  entity: Entity<C>,
  values: Partial<C>
) {
  for (const compName in values) {
    if (compName === "id" || compName === "name") return;
    if (entity[compName]) {
      Object.assign(entity, { [compName]: deepclone(values[compName]) });
    } else {
      Log(
        "warn",
        `Default values component ${compName} does not exist on ${entity.name}`,
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
export type System<N extends string> = {
  name: N;
  init: SystemInit;
  update: SystemUpdate;
  beforeUpdate: SystemUpdate;
  afterUpdate: SystemUpdate;
};
export type SystemProps<N extends string> = {
  name: N;
  init?: SystemInit;
  update?: SystemUpdate;
  beforeUpdate?: SystemUpdate;
  afterUpdate?: SystemUpdate;
  world?: World;
};
export function newSystem<N extends string>(props: SystemProps<N>): System<N> {
  const system: System<N> = {
    name: props.name,
    init: props.init,
    update: props.update,
    beforeUpdate: props.beforeUpdate,
    afterUpdate: props.afterUpdate,
  };
  if (props.world) addSystemToWorld(system, props.world);
  return system;
}
