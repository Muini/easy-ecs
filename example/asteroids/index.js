import { World } from "../../core/ecs";
import {
  Time,
  Input,
  Loop,
  Renderer,
  SaveSystem,
  Config,
} from "../../core/addons";

import {
  GlobalMovements,
  SpaceshipMovements,
  SpaceshipRenderer,
  AsteroidRenderer,
  SpaceBodyCollisions,
  SpaceshipShieldControl,
  AutoDestroySystem,
  UIGaugeRenderer,
  UITextRenderer,
  ParticlesRenderer,
  TrailSystem,
} from "./systems";
import { Spaceship, Asteroid, UIScore, UIShieldBar, UIText } from "./entities";

import defaultConfig from "./Config.json";

// ====================================
// Config Setup
// ====================================

Config.load(defaultConfig);
// Restore previous config if existing
const restoredConfig = SaveSystem.restoreData("config");
if (restoredConfig) Config.overwrite(restoredConfig);

SaveSystem.saveData("config", Config.serialize());

// ====================================
// Renderer Setup
// ====================================

Renderer.setup(
  document.getElementById("game"),
  Config.world.width,
  Config.world.height
);
Renderer.onResize = () => {
  const relWidth = window.innerWidth * 0.95;
  const relHeight = window.innerHeight * 0.95;
  const width = relWidth < relHeight ? relWidth : relHeight;
  const height =
    (relHeight < relWidth ? relHeight : relWidth) * Config.world.ratio;
  Renderer.worldScale =
    (relWidth < relHeight
      ? relWidth / Config.world.width
      : (relHeight / Config.world.height) * Config.world.ratio) *
    window.devicePixelRatio;
  Renderer.width = Config.world.width;
  Renderer.height = Config.world.height;
  Renderer.canvas.width = width * window.devicePixelRatio;
  Renderer.canvas.height = height * window.devicePixelRatio;
  Renderer.canvas.style["width"] = width;
  Renderer.canvas.style["height"] = height;
};
Renderer.onResize();

// ====================================
// World Setup
// ====================================

const world = new World({
  addons: [Loop, Time, Input, Renderer, SaveSystem, Config],
  systems: [
    // Player
    SpaceshipMovements,
    SpaceshipShieldControl,
    // Game
    GlobalMovements,
    SpaceBodyCollisions,
    AutoDestroySystem,
    // Renderer
    TrailSystem,
    ParticlesRenderer,
    AsteroidRenderer,
    SpaceshipRenderer,
    // UI Renderer
    UIGaugeRenderer,
    UITextRenderer,
  ],
});

// ====================================
// Scene Setup
// ====================================

const player = new Spaceship(world, {
  position: {
    x: (Config.world.width / 2) << 0,
    y: (Config.world.height / 2) << 0,
  },
  size: Config.player.size,
  mass: Config.player.mass,
  color: Config.palette.lightest,
  shieldColor: Config.palette.lightest,
});

for (let i = 0; i < Config.asteroids.amount; i++) {
  const size = Math.max(
    (Math.random() * Config.asteroids.max_size) << 0,
    Config.asteroids.min_size
  );
  new Asteroid(world, {
    color: Config.palette.light,
    position: {
      x: (Math.random() * Config.world.width) << 0,
      y: (Math.random() * Config.world.height) << 0,
    },
    velocity: {
      x: Math.random() * Config.asteroids.max_velocity,
      y: Math.random() * Config.asteroids.max_velocity,
    },
    size: size,
    mass: size,
  });
}

const scoreLabel = new UIText(world, {
  x: 0.05,
  y: 0.86,
  text: "SCORE",
  fontSize: 12,
  color: Config.palette.light,
});

const score = new UIScore(world, {
  x: 0.05,
  y: 0.89,
  text: "0",
  fontSize: 24,
  color: Config.palette.lightest,
});

const shieldLabel = new UIText(world, {
  x: 0.05,
  y: 0.92,
  text: "SHIELD",
  fontSize: 12,
  color: Config.palette.light,
});

const shieldBar = new UIShieldBar(world, {
  width: 0.15,
  height: 0.015,
  x: 0.05,
  y: 0.93,
  color: Config.palette.lightest,
  maxValue: player.shieldPower,
  value: player.shieldPower,
});

// ====================================
// Game Start
// ====================================

world.start();
