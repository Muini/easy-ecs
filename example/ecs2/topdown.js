import {
  newWorld,
  newComponent,
  newEntity,
  updateWorld,
  queryEntities,
  newSystem,
  initWorld,
  addEntityToWorld,
} from "../../core/ecs2";
import {
  Loop,
  Time,
  Input,
  Renderer,
  SaveSystem,
  // Config,
} from "../../core/addons2";
import {
  INPUT_LEFT,
  INPUT_RIGHT,
  INPUT_UP,
  INPUT_DOWN,
} from "../../core/addons2/input";

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
const Position = newComponent("position", [0, 0]);
const Movement = newComponent("movement", { speed: 0 });
const Controllable = newComponent("controllable");
const Sprite = newComponent("sprite", {
  width: 16,
  height: 32,
});

// ====================================
// Entities
// ====================================
const Character = newEntity([Position, Movement, Sprite], {
  position: [0, 0],
  movement: { speed: 10 },
});
const Hero = newEntity([Position, Movement, Sprite, Controllable], {
  position: [256, 256],
  movement: { speed: 10 },
});

// ====================================
// Systems
// ====================================
const SpriteRenderer = newSystem("SpriteRenderer", null, (world) => {
  const entities = queryEntities(world, [Position, Sprite]);
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    Renderer.ctx.translate(
      entity.position[0] * Renderer.worldScale,
      entity.position[1] * Renderer.worldScale
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
});

const MovementControl = newSystem("MovementControl", null, (world) => {
  const entities = queryEntities(world, [Position, Movement, Controllable]);
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const amount = entity.movement.speed * Time.delta * 0.025;
    Input.keypress.forEach((key) => {
      switch (key) {
        case INPUT_LEFT:
          entity.position[0] -= amount;
          break;
        case INPUT_RIGHT:
          entity.position[0] += amount;
          break;
        case INPUT_UP:
          entity.position[1] -= amount;
          break;
        case INPUT_DOWN:
          entity.position[1] += amount;
          break;
      }
    });
  }
});

// ====================================
// Scene Setup
// ====================================
const world = newWorld(
  [MovementControl, SpriteRenderer],
  [Loop, Time, Input, Renderer, SaveSystem]
);

addEntityToWorld(Hero, world);
addEntityToWorld(Character, world, {
  position: [Math.ceil(Math.random() * 512), Math.ceil(Math.random() * 512)],
});

// ====================================
// Game Start
// ====================================

console.log(world);

// Init
initWorld(world);

// Start loop
updateWorld(world);
