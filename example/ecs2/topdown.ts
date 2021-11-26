import {
  newWorld,
  newComponent,
  newPrefab,
  newEntity,
  updateWorld,
  queryEntities,
  newSystem,
  initWorld,
} from "../../core/ecs";
import {
  Loop,
  Input,
  CanvasRenderer as Renderer,
  // SaveSystem,
  // Config,
} from "../../core/modules";

// ====================================
// Config Setup
// ====================================

/*Config.load(defaultConfig);
// Restore previous config if existing
const restoredConfig = SaveSystem.restoreData("config");
if (restoredConfig) Config.overwrite(restoredConfig);

SaveSystem.saveData("config", Config.serialize());*/

// ====================================
// Renderer Setup
// ====================================

Renderer.setup(document.getElementById("game"), 512, 512);

// ====================================
// Components
// ====================================
const Position = newComponent("position", { x: 0, y: 0 });
const Movement = newComponent("movement", { speed: 0 });
const Controllable = newComponent("controllable");
const Sprite = newComponent("sprite", {
  width: 16,
  height: 32,
});

// ====================================
// Entities
// ====================================
const Character = newPrefab("Character", [Position, Movement, Sprite], {
  position: { x: 0, y: 0 },
  movement: { speed: 10 },
});
const Hero = newPrefab("Hero", [Position, Movement, Sprite, Controllable], {
  position: { x: 256, y: 256 },
  movement: { speed: 10 },
});

// ====================================
// Systems
// ====================================
const SpriteRenderer = newSystem({
  name: "SpriteRenderer",
  update: (world, dt) => {
    const entities = queryEntities(world, { has: [Position, Sprite] });
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      Renderer.ctx.translate(
        entity.position.x * Renderer.worldScale,
        entity.position.y * Renderer.worldScale
      );

      Renderer.ctx.fillStyle = "rgba(255,255,255,1.0)";
      Renderer.ctx.beginPath();
      const width = entity.sprite.width * Renderer.worldScale;
      const height = entity.sprite.height * Renderer.worldScale;
      Renderer.ctx.rect(-width / 2, 0, width, -height);
      Renderer.ctx.fill();
      Renderer.ctx.closePath();

      Renderer.ctx.globalAlpha = 1;
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  },
});

const INPUT = {
  Left: "ArrowLeft",
  Right: "ArrowRight",
  Up: "ArrowUp",
  Down: "ArrowDown",
  Space: "Space",
};

const MovementControl = newSystem({
  name: "MovementControl",
  update: (world, dt) => {
    const entities = queryEntities(world, {
      has: [Position, Movement, Controllable],
    });
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const amount = entity.movement.speed * dt * 0.025;
      Input.keypress.forEach((key) => {
        switch (key) {
          case INPUT.Left:
            entity.position.x -= amount;
            break;
          case INPUT.Right:
            entity.position.x += amount;
            break;
          case INPUT.Up:
            entity.position.y -= amount;
            break;
          case INPUT.Down:
            entity.position.y += amount;
            break;
        }
      });
    }
  },
});

// ====================================
// Scene Setup
// ====================================
const world = newWorld([
  //Modules
  Loop.system,
  Input.system,
  Renderer.system,
  //Systems
  MovementControl,
  SpriteRenderer,
]);

newEntity(Hero, world);
newEntity(Character, world, {
  position: {
    x: Math.ceil(Math.random() * 512),
    y: Math.ceil(Math.random() * 512),
  },
});

// ====================================
// Game Start
// ====================================

console.log(world);

// Init & Start loop
initWorld(world);
