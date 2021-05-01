import {
  newWorld,
  newComponent,
  newEntity,
  updateWorld,
  queryEntities,
  newSystem,
  removeEntityFromWorld,
  initWorld,
} from "../../core/ecs2";
import { Time } from "../../core/addons2/time";
import { Loop } from "../../core/addons2/loop";

let start = performance.now();

const world = newWorld();
// ====================================
// Components
// ====================================
const Position = newComponent("Position", [0, 0], world);
const Health = newComponent("Health", { maxHp: 0, hp: 0 }, world);
const Axe = newComponent("Axe", { damage: 1, range: 2 }, world);
const Sword = newComponent("Sword", { damage: 2, range: 4 }, world);
const Ennemy = newComponent("Ennemy", {}, world);
const Hero = newComponent("Hero", {}, world);
// ====================================
// Systems
// ====================================
const Die = newSystem(
  "Die",
  null,
  (world) => {
    const entities = queryEntities(world, [Health]);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.hp < 0) {
        removeEntityFromWorld(entity, world);
      }
    }
  },
  world
);
const HeroAttack = newSystem(
  "HeroAttack",
  null,
  (world) => {
    const entities = queryEntities(world, [Hero, Sword]);
    const ennemies = queryEntities(world, [Ennemy, Health]);
    for (let i = 0; i < entities.length; i++) {
      const hero = entities[i];
      const firstEnnemy = ennemies[0];
      firstEnnemy.hp -= hero.damage;
    }
  },
  world
);
const EnnemyAttack = newSystem(
  "EnnemyAttack",
  null,
  (world) => {
    const entities = queryEntities(world, [Ennemy, Axe]);
    const heros = queryEntities(world, [Hero, Health]);
    for (let i = 0; i < entities.length; i++) {
      const ennemy = entities[i];
      const firstHero = heros[0];
      firstHero.hp -= ennemy.damage;
    }
  },
  world
);
const initTime = performance.now() - start;
start = performance.now();

// ====================================
// Scene Setup
// ====================================
const Bob = newEntity(
  [Position, Health, Hero, Sword],
  {
    position: [0, 0],
    health: { hp: 1000, maxHp: 1000 },
  },
  world
);

for (let i = 0; i < 4000; i++) {
  newEntity(
    [Position, Health, Ennemy, Axe],
    {
      position: [
        Math.ceil(Math.random() * 1000),
        Math.ceil(Math.random() * 1000),
      ],
      health: {
        maxHp: 4,
        hp: 4,
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
const UPDATES = 1000;
for (let i = 0; i < UPDATES; i++) {
  updateWorld(world, i);
}
// console.log(world.entities);

const updateTime = performance.now() - start;
console.log(
  "init time",
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
console.log(world);
