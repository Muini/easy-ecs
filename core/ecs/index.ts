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
export type Data = {
  [key: string]: any;
};
export type Tag = { name: string };
export type Component<D extends Data> = Tag & {
  data: D;
};
type ComponentProps<C extends Component<any>> = {
  [P in keyof C["data"]]: C["data"][P];
};
type PartialComponentProps<C extends Component<any>> = Partial<
  ComponentProps<C>
>;

export function newComponent<D extends Data | undefined>(
  name: string,
  data?: D
) {
  return { name, data } as D extends undefined ? Tag : Component<D>;
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
  applyValuesToEntity(newEntity, defaultValues ?? prefab.defaultValues);
  world.entities.push(newEntity);
  return newEntity;
}
export type Query<C extends Component<any>, N extends Component<any>> = {
  has?: C[];
  not?: N[];
};
enum QueryType {
  Has,
  Not,
  Both,
  None,
}

export function queryEntities<
  C extends Component<any>,
  N extends Component<any>
>(world: World, query: Query<C, N>): Entity<C>[] {
  console.log();
  const has = !!(query.has && query.has.length);
  const not = !!(query.not && query.not.length);
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
          query.has.every(
            <C>(component: Component<C>) =>
              entity.components.indexOf(component.name) >= 0
          ) &&
          !query.not.every(
            <N>(component: Component<N>) =>
              entity.components.indexOf(component.name) >= 0
          )
      );
    case QueryType.Has:
      return world.entities.filter((entity) =>
        query.has.every(
          <C>(component: Component<C>) =>
            entity.components.indexOf(component.name) >= 0
        )
      );
    case QueryType.Not:
      return world.entities.filter(
        (entity) =>
          !query.not.every(
            <N>(component: Component<N>) =>
              entity.components.indexOf(component.name) >= 0
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
export function applyValuesToEntity<C extends Component<any>>(
  entity: Entity<C>,
  values: PartialEntityProps<C>
) {
  if (!values || !Object.keys(values) || !Object.keys(values).length) return;
  for (const comp in values) {
    if (entity[comp]) {
      const compValues = values[comp] as ComponentProps<C>;
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
