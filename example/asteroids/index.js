import { World } from "../../core/ecs";
import { Time, Input, Loop, Renderer, SaveSystem } from "../../core/addons";

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

import { config } from "./config";

// ====================================
// Renderer Setup
// ====================================

Renderer.setup(
  document.getElementById("game"),
  config.world.width,
  config.world.height
);
Renderer.onResize = () => {
  const relWidth = window.innerWidth * 0.95;
  const relHeight = window.innerHeight * 0.95;
  const width = relWidth < relHeight ? relWidth : relHeight;
  const height =
    (relHeight < relWidth ? relHeight : relWidth) * config.world.ratio;
  Renderer.worldScale =
    (relWidth < relHeight
      ? relWidth / config.world.width
      : (relHeight / config.world.height) * config.world.ratio) *
    window.devicePixelRatio;
  Renderer.width = config.world.width;
  Renderer.height = config.world.height;
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
  addons: [Loop, Time, Input, Renderer, SaveSystem],
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
    x: (config.world.width / 2) << 0,
    y: (config.world.height / 2) << 0,
  },
  size: config.player.size,
  mass: config.player.mass,
  color: config.palette.lightest,
  shieldColor: config.palette.lightest,
});

for (let i = 0; i < config.asteroids.amount; i++) {
  const size = Math.max(
    (Math.random() * config.asteroids.max_size) << 0,
    config.asteroids.min_size
  );
  new Asteroid(world, {
    color: config.palette.light,
    position: {
      x: (Math.random() * config.world.width) << 0,
      y: (Math.random() * config.world.height) << 0,
    },
    velocity: {
      x: Math.random() * config.asteroids.max_velocity,
      y: Math.random() * config.asteroids.max_velocity,
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
  color: config.palette.light,
});

const score = new UIScore(world, {
  x: 0.05,
  y: 0.89,
  text: "0",
  fontSize: 24,
  color: config.palette.lightest,
});

const shieldLabel = new UIText(world, {
  x: 0.05,
  y: 0.92,
  text: "SHIELD",
  fontSize: 12,
  color: config.palette.light,
});

const shieldBar = new UIShieldBar(world, {
  width: 0.15,
  height: 0.015,
  x: 0.05,
  y: 0.93,
  color: config.palette.lightest,
  maxValue: player.shieldPower,
  value: player.shieldPower,
});

// ====================================
// Game Start
// ====================================

world.start();
