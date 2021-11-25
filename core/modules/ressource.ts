import { Entity, newComponent, newSystem, queryEntities } from "../ecs";

export const Ressource = newComponent("ressource", {
  path: "",
  loaded: false,
});

export const RessourceManager = {
  ressources: [],
  async load(path: string) {},
};

function loadEntityRessource(entity: Entity<typeof Ressource>) {
  if (entity.ressource.loaded) return;
  RessourceManager.load(entity.ressource.path).then(() => {
    entity.ressource.loaded = true;
  });
}

export const RessourceLoader = newSystem(
  "ressource-loader",
  (world) => {
    const entities = queryEntities(world, { has: [Ressource] });
    // TODO: start loading ressource
    entities.forEach((entity) => {
      loadEntityRessource(entity as any);
    });
  },
  (world, dt: number) => {}
);
