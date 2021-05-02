import { World, Entity, Component, System } from "../core/ecs";

let start = performance.now();
// ====================================
// Components
// ====================================
class Position extends Component {
  static name = "Position";
  static position = { x: 0, y: 0 };
}
class Health extends Component {
  static name = "Health";
  static maxHp = 0;
  static hp = 0;
}
class Weapon extends Component {
  static name = "Weapon";
}
class Axe extends Weapon {
  static name = "Axe";
  static damage = 1;
  static range = 2;
}
class Sword extends Weapon {
  static name = "Sword";
  static damage = 2;
  static range = 4;
}
class Ennemy extends Component {
  static name = "Ennemy";
}
class Hero extends Component {
  static name = "Hero";
}
// ====================================
// Entities
// ====================================
class Character extends Entity {
  static name = "Character";
  static components = [Position, Health];
}
class Bob extends Character {
  static name = "Bob";
  static components = [...super.components, Hero, Sword];
}
class Goblin extends Character {
  static name = "Goblin";
  static components = [...super.components, Ennemy, Axe];
}
// ====================================
// Systems
// ====================================
class Die extends System {
  dependencies = [Health];
  onUpdate = (entities) => {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.hp < 0) {
        entity.destroy();
      }
    }
  };
}

class HeroAttack extends System {
  dependencies = [Hero, Sword];
  onUpdate = (entities) => {
    const ennemies = this.world.getEntitiesWithComponents([Ennemy, Health]);
    for (let i = 0; i < entities.length; i++) {
      const hero = entities[i];
      const ennemy = ennemies[0];
      ennemy.hp -= hero.damage;
    }
  };
}

class EnnemyAttack extends System {
  dependencies = [Ennemy, Axe];
  onUpdate = (entities) => {
    const heros = this.world.getEntitiesWithComponents([Hero, Health]);
    for (let i = 0; i < entities.length; i++) {
      const ennemy = entities[i];
      const hero = heros[0];
      hero.hp -= ennemy.damage;
    }
  };
}
const initTime = performance.now() - start;
start = performance.now();
// ====================================
// World Setup
// ====================================
const world = new World({
  addons: [],
  systems: [Die, HeroAttack, EnnemyAttack],
});

// ====================================
// Scene Setup
// ====================================
for (let i = 0; i < 10000; i++) {
  new Bob(world, {
    position: { x: 0, y: 0 },
    maxHp: 1000,
    hp: 1000,
  });
}
for (let i = 0; i < 10000; i++) {
  new Goblin(world, {
    position: {
      x: Math.ceil(Math.random() * 1000),
      y: Math.ceil(Math.random() * 1000),
    },
    maxHp: 4,
    hp: 4,
  });
}
// console.log(world.entities[0].maxHp);
const worldSetupTime = performance.now() - start;
start = performance.now();

// ====================================
// Game Start
// ====================================

world.start();
const worldStartTime = performance.now() - start;
start = performance.now();

// update 1000 times
const UPDATES = 1000;
for (let i = 0; i < UPDATES; i++) {
  world.update(i);
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
