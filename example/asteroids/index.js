
import { World } from '../../core/ecs';
import { Time, Input, Loop, Renderer, SaveSystem } from '../../core/addons';

import { GlobalMovements, SpaceshipMovements, SpaceshipRenderer, AsteroidRenderer, SpaceBodyCollisions, SpaceshipShieldControl, AutoDestroySystem, UIGaugeRenderer, UITextRenderer, ParticlesRenderer, TrailSystem } from './systems';
import { Spaceship, Asteroid, UIScore, UIShieldBar, UIText } from './entities';

import { WORLD_WIDTH, WORLD_HEIGHT, WORLD_RATIO, PALETTE, ASTEROIDS_AMOUNT, ASTEROIDS_MIN_SIZE, ASTEROIDS_MAX_SIZE, ASTEROIDS_MAX_VELOCITY, PLAYER_SIZE, PLAYER_MASS } from './config'

// ====================================
// Renderer Setup
// ====================================

Renderer.setup(document.getElementById('game'), WORLD_WIDTH, WORLD_HEIGHT);
Renderer.onResize = () => {
  const relWidth = window.innerWidth * 0.95;
  const relHeight = window.innerHeight * 0.95;
  const width = (relWidth < relHeight ? relWidth : relHeight);
  const height = (relHeight < relWidth ? relHeight : relWidth) * WORLD_RATIO;
  Renderer.worldScale = (relWidth < relHeight ? relWidth / WORLD_WIDTH : relHeight / WORLD_HEIGHT * WORLD_RATIO) * window.devicePixelRatio;
  Renderer.width = WORLD_WIDTH;
  Renderer.height = WORLD_HEIGHT;
  Renderer.canvas.width = width * window.devicePixelRatio;
  Renderer.canvas.height = height * window.devicePixelRatio;
  Renderer.canvas.style['width'] = width;
  Renderer.canvas.style['height'] = height;
}
Renderer.onResize()

// ====================================
// World Setup
// ====================================

const world = new World({
  addons: [
    Loop, 
    Time, 
    Input, 
    Renderer,
    SaveSystem,
  ],
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
    UITextRenderer
  ]
});

// ====================================
// Scene Setup
// ====================================

const player = new Spaceship(world, {
  position: {
    x: WORLD_WIDTH / 2 << 0,
    y: WORLD_HEIGHT / 2 << 0,
  },
  size: PLAYER_SIZE,
  mass: PLAYER_MASS,
  color: PALETTE.lightest,
  shieldColor: PALETTE.lightest
})

for (let i = 0; i < ASTEROIDS_AMOUNT; i++) {
  const size = Math.max(Math.random() * ASTEROIDS_MAX_SIZE << 0, ASTEROIDS_MIN_SIZE);
  new Asteroid(world, {
    color: PALETTE.light,
    position: {
      x: Math.random() * WORLD_WIDTH << 0,
      y: Math.random() * WORLD_HEIGHT << 0,
    },
    velocity: {
      x: Math.random() * ASTEROIDS_MAX_VELOCITY,
      y: Math.random() * ASTEROIDS_MAX_VELOCITY,
    },
    size: size,
    mass: size
  })
}

const scoreLabel = new UIText(world, {
  x: 0.05,
  y: 0.86,
  text: 'SCORE',
  fontSize: 12,
  color: PALETTE.light,
})

const score = new UIScore(world, {
  x: 0.05,
  y: 0.89,
  text: '0',
  fontSize: 28,
  color: PALETTE.lightest,
})

const shieldLabel = new UIText(world, {
  x: 0.05,
  y: 0.92,
  text: 'SHIELD',
  fontSize: 12,
  color: PALETTE.light,
})

const shieldBar = new UIShieldBar(world, {
  width: 0.15,
  height: 0.015,
  x: 0.05,
  y: 0.93,
  color: PALETTE.lightest,
  maxValue: player.shieldPower,
  value: player.shieldPower,
})

// ====================================
// Game Start
// ====================================

world.start()