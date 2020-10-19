
import { World } from '../core/ecs';
import { Time, Input, Loop, Renderer, SaveSystem, Rules } from '../core/addons';

import { GlobalMovements, SpaceshipMovements, SpaceshipRenderer, AsteroidRenderer, SpaceBodyCollisions, SpaceshipShieldControl, AutoDestroySystem, UIGaugeRenderer, UITextRenderer, ParticlesRenderer } from './asteroids/systems';
import { Spaceship, Asteroid, Debris, UIScore, UIShieldBar } from './asteroids/entities';

// ====================================
// Game Setup
// ====================================

const WINDOW_SIZE = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
Renderer.setup(document.getElementById('game'), WINDOW_SIZE, WINDOW_SIZE * 0.75);

const world = new World({
  addons: [
    Loop, 
    Time, 
    Input, 
    Renderer,
    SaveSystem, 
    Rules
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

const PALETTE = {
  lightest: `rgba(241, 250, 238, 1)`,
  light: `rgba(168, 218, 220, 1)`,
  medium: `rgba(69, 123, 157, 1)`,
  accentuation: `rgba(230, 57, 70, 1)`
}

const player = new Spaceship(world, {
  position: {
    x: Renderer.width / 2 << 0,
    y: Renderer.height / 2 << 0,
  },
  size: 10,
  mass: 8,
  color: PALETTE.lightest,
  shieldColor: PALETTE.lightest
})

const ASTEROIDS_AMOUNT = 10;
const ASTEROIDS_MIN_SIZE = 10;
const ASTEROIDS_MAX_SIZE = 60;
const ASTEROIDS_MAX_VELOCITY = 0.1;

for (let i = 0; i < ASTEROIDS_AMOUNT; i++) {
  const size = Math.max(Math.random() * ASTEROIDS_MAX_SIZE << 0, ASTEROIDS_MIN_SIZE);
  new Asteroid(world, {
    color: PALETTE.light,
    position: {
      x: Math.random() * Renderer.width << 0,
      y: Math.random() * Renderer.width << 0,
    },
    velocity: {
      x: Math.random() * ASTEROIDS_MAX_VELOCITY,
      y: Math.random() * ASTEROIDS_MAX_VELOCITY,
    },
    size: size,
    mass: size
  })
}

const score = new UIScore(world, {
  x: Renderer.width * 0.05,
  y: Renderer.height * 0.925,
  text: '0',
  fontSize: 24,
  color: PALETTE.lightest,
})

const shieldBar = new UIShieldBar(world, {
  width: Renderer.width * 0.15,
  height: 12,
  x: Renderer.width * 0.05,
  y: Renderer.height * 0.95,
  color: PALETTE.lightest,
  maxValue: player.shieldPower,
  value: player.shieldPower,
})

// ====================================
// Game Rules
// ====================================

const isSpaceship = (entity) => { return entity.constructor === Spaceship }
const isAsteroid = (entity) => { return entity.constructor === Asteroid }
const rotateVector = (v, angle) => {
  const newV = {x: v.x, y: v.y}
  newV.x = v.x*Math.cos(angle) - v.y*Math.sin(angle);
  newV.y = v.x*Math.sin(angle) + v.y*Math.cos(angle);
  return newV
}
const createParticles = (number, basePosition, baseVelocity, color) => {
  for (let i = 0; i < number; i++) {
    const velocity = { x: Math.random() * baseVelocity.x / 2, y: Math.random() * baseVelocity.y / 2 };
    new Debris(world, {
      color: color,
      position: {
        x: basePosition.x,
        y: basePosition.y,
      },
      lifeTime: 500 + (Math.random() * 1000) << 0,
      velocity: rotateVector(velocity, Math.random() * Math.PI * 2),
      size: 1,
    })
  }
}
// Set the rules
Rules.on('collision.break', ({
  entity
  }) => {
    // console.log('break', entity.constructor.name)
    if(isAsteroid(entity)){
      // Break asteroid in half
      const shouldSplit = entity.size > (ASTEROIDS_MIN_SIZE / 2)
      if(shouldSplit){
        const newSize = entity.size / 2
        new Asteroid(world, {
          color: PALETTE.light,
          position: {
            x: entity.position.x,
            y: entity.position.y,
          },
          velocity: rotateVector(entity.velocity, Math.PI / 4),
          size: newSize,
          mass: newSize
        })
        new Asteroid(world, {
          color: PALETTE.light,
          position: {
            x: entity.position.x,
            y: entity.position.y,
          },
          velocity:  rotateVector(entity.velocity, -Math.PI / 4),
          size: newSize,
          mass: newSize
        })
      }
      createParticles(entity.size << 0, entity.position, entity.velocity, PALETTE.medium);
      const bonus = entity.size / 10 << 0;
      Rules.notify('score.add', bonus)
      entity.destroy()
    }else if(isSpaceship(entity)){
      const malus = 20;
      createParticles(malus, entity.position, entity.velocity, PALETTE.accentuation);
      Rules.notify('score.add', -malus)
    }
  }
)
Rules.on('collision', ({
  entity,
  hitEntity,
  impulse
}) => {
  // console.log('collision', entity.constructor.name, hitEntity.constructor.name)
  
  // If spaceship hits an asteroid
  if(
    (isAsteroid(entity) && isSpaceship(hitEntity)) ||
    (isAsteroid(hitEntity) && isSpaceship(entity))
  ){
    if(player.hasShield){
      impulse *= player.shieldForce;
      const bonus = impulse * 1000 << 0;
      createParticles(bonus << 0, entity.position, { x: entity.velocity.x * 1.5, y: entity.velocity.y * 1.5 }, PALETTE.lightest);
      Rules.notify('score.add', bonus)
    }else{
      const malus = impulse * 1000 << 0;
      createParticles(malus, entity.position, { x: entity.velocity.x * 1.5, y: entity.velocity.y * 1.5 }, PALETTE.accentuation);
      Rules.notify('score.add', -malus)
    }
  }
  const shouldBreakEntity = impulse * 1000 > hitEntity.mass;
  const shouldBreakHitEntity = impulse * 1000 > entity.mass;
  if(shouldBreakEntity){
    Rules.notify('collision.break', {entity: hitEntity})
  }
  if(shouldBreakHitEntity){
    Rules.notify('collision.break', {entity: entity})
  }
})

Rules.on('score.add', (points) => {
  score.score += points;
  if(score.score < 0) score.score = 0;
  score.text = `${score.score}`;
})

Rules.on('shield.update', (shieldValue) => {
  shieldBar.value = shieldValue;
})

// ====================================
// Game Start
// ====================================

world.start()