import {
  newWorld,
  newComponent,
  newEntity,
  updateWorld,
  queryEntities,
  newSystem,
  removeEntityFromWorld,
  initWorld,
  addComponentToEntity,
  removeComponentFromEntity,
  cloneEntity,
} from "../../core/ecs";
import { SaveSystem } from "../../core/modules/saveSystem";

let start = performance.now();

// ====================================
// Components
// ====================================
const Position = newComponent("position", { x: 0, y: 0 });
const Health = newComponent("health", { maxHp: 0, hp: 0 });
const Axe = newComponent("axe", { damage: 1, range: 2 });
const Sword = newComponent("sword", { damage: 2, range: 4 });
const Ennemy = newComponent("ennemy", true);
const Hero = newComponent("hero", true);
// ====================================
// Entities
// ====================================
const hero = newEntity("Hero", [Position, Health, Hero, Sword], {
  position: { x: 0, y: 0 },
  health: { hp: 1000, maxHp: 1000 },
});
const ennemy = newEntity("Ennemy", [Position, Health, Ennemy, Axe], {
  health: {
    maxHp: 4,
    hp: 4,
  },
});
// ====================================
// Systems
// ====================================
const Die = newSystem({
  name: "Die",
  update: (world) => {
    const entities = queryEntities(world, { has: [Health] });
    if (!entities.length) return;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.health.hp < 0) {
        removeEntityFromWorld(entity, world);
      }
    }
  },
});
const HeroAttack = newSystem({
  name: "HeroAttack",
  update: (world) => {
    const entities = queryEntities(world, { has: [Hero, Sword] });
    if (!entities.length) return;
    const ennemies = queryEntities(world, { has: [Ennemy, Health] });
    if (!ennemies.length) return;
    for (let i = 0; i < entities.length; i++) {
      const hero = entities[i];
      const firstEnnemy = ennemies[0];
      firstEnnemy.health.hp -= hero.sword.damage;
    }
  },
});
const EnnemyAttack = newSystem({
  name: "EnnemyAttack",
  update: (world) => {
    const entities = queryEntities(world, { has: [Ennemy, Axe] });
    if (!entities.length) return;
    const heros = queryEntities(world, { has: [Hero, Health] });
    if (!heros.length) return;
    for (let i = 0; i < entities.length; i++) {
      const ennemy = entities[i];
      const firstHero = heros[0];
      firstHero.health.hp -= ennemy.axe.damage;
    }
  },
});
const initTime = performance.now() - start;
start = performance.now();

// ====================================
// Scene Setup
// ====================================
const world = newWorld([Die, HeroAttack, EnnemyAttack]);
// Heros
for (let i = 0; i < 50000; i++) {
  cloneEntity(hero, {}, world);
}
// Ennemies
for (let i = 0; i < 50000; i++) {
  cloneEntity(
    ennemy,
    {
      position: {
        x: Math.ceil(Math.random() * 1000),
        y: Math.ceil(Math.random() * 1000),
      },
    },
    world
  );
}
// console.log(world.entities[0].maxHp);
const worldSetupTime = performance.now() - start;
start = performance.now();

// ====================================
// Game Start
// ====================================

initWorld(world);
const worldStartTime = performance.now() - start;
start = performance.now();

// update 1000 times
const UPDATES = 100;
for (let i = 0; i < UPDATES; i++) {
  updateWorld(world, performance.now());
}
// console.log(world);

const updateTime = performance.now() - start;
console.log(
  "Entities amount",
  world.entities.length,
  "\ninit time",
  initTime,
  "ms \nworld setup time",
  worldSetupTime,
  "ms \nworld start time",
  worldStartTime,
  "ms \nupdate time",
  updateTime,
  "ms \nupdate time average",
  updateTime / UPDATES,
  "ms \ntotal",
  initTime + worldSetupTime + worldStartTime + updateTime,
  "ms"
);

start = performance.now();
SaveSystem.saveWorld("test", world);
const saveTime = performance.now() - start;
start = performance.now();
SaveSystem.restoreWorld("test", world);
const restoreTime = performance.now() - start;
console.log("save time", saveTime, "ms \nrestore time", restoreTime, "ms");

/*
//Test suite
const Position = newComponent("position", { x: 0, y: 0 });
const Axe = newComponent("axe", { damage: 0 });
const Health = newComponent("health", 100);
const PowerUp = newComponent("power", true);

const Hero = newEntity("Hero", [Position, Health], {
  position: { x: 5, y: 5 },
});
const Ennemy = newEntity("Ennemy", [Position, Axe, Health]);

const System = newSystem({
  name: "test",
  update: (world, dt) => {
    const entities = queryEntities(world, { has: [Position], not: [Axe] });
    entities.forEach((entity) => (entity.position.x += 1));
    console.log("query result", entities);
  },
});

const world = newWorld([System]);
const hero = cloneEntity(Hero, {}, world);
const ennemy = cloneEntity(Ennemy, { position: { x: -1, y: 3 } }, world);

addComponentToEntity(hero, PowerUp, world);

updateWorld(world, performance.now());

removeComponentFromEntity(ennemy, Axe, world);

console.log(world);
*/
