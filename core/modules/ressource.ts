import { Entity, newComponent, newSystem, queryEntities, World } from "../ecs";

export const Ressource = newComponent("ressource", {
  path: "",
  loaded: false,
});

Ressource.data.loaded;

export const RessourceManager = {
  ressources: [],
  loadRessource(path: string) {},
};

function loadEntityRessource(entity: Entity) {
  if (entity.ressource.loaded) return;
  RessourceManager.load(entity.ressource.path);
}

export const RessourceLoader = newSystem(
  "ressource-loader",
  (world: World) => {
    const entities = queryEntities(world, { has: [Ressource] });
    // TODO: start loading ressource
    entities.forEach((entity) => {
      loadEntityRessource(entity);
    });
  },
  (world: World, dt: number) => {}
);
