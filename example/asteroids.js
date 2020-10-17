
import { World } from '../core/ecs';
import { Time, Input, Loop, Renderer, SaveSystem, Rules } from '../core/addons';

import { GlobalMovements, SpaceshipMovements, SpaceshipRenderer, AsteroidRenderer, SpaceBodyCollisions, SpaceshipShieldControl, AutoDestroySystem } from './asteroids/systems';
import { Spaceship, Asteroid, AsteroidDebris } from './asteroids/entities';

Renderer.setup(document.getElementById('game'), 512, 512);

const world = new World({
  addons: [Loop, Time, Input, Renderer, SaveSystem, Rules],
  systems: [GlobalMovements, SpaceshipMovements, SpaceshipShieldControl, SpaceshipRenderer, AsteroidRenderer, SpaceBodyCollisions, AutoDestroySystem]
});

const player = new Spaceship(world, {
  position: {
    x: Renderer.width / 2 << 0,
    y: Renderer.height / 2 << 0,
  },
  size: 3,
  mass: 6
})

const ASTEROIDS_AMOUNT = 10;
const ASTEROIDS_MIN_SIZE = 10;
const ASTEROIDS_MAX_SIZE = 50;

for (let i = 0; i < ASTEROIDS_AMOUNT; i++) {
  const size = Math.max(Math.random() * ASTEROIDS_MAX_SIZE << 0, ASTEROIDS_MIN_SIZE);
  new Asteroid(world, {
    color: `rgba(170, 170, 170, 1)`,
    position: {
      x: Math.random() * Renderer.width << 0,
      y: Math.random() * Renderer.width << 0,
    },
    velocity: {
      x: Math.random() * 0.05,
      y: Math.random() * 0.05,
    },
    size: size,
    mass: size
  })
}

const isSpaceship = (entity) => { return entity.constructor === Spaceship }
const isAsteroid = (entity) => { return entity.constructor === Asteroid }
const rotateVector = (v, angle) => {
  const newV = {x: v.x, y: v.y}
  newV.x = v.x*Math.cos(angle) - v.y*Math.sin(angle);
  newV.y = v.x*Math.sin(angle) + v.y*Math.cos(angle);
  return newV
}
const createDebris = (number, basePosition, baseVelocity) => {
  for (let i = 0; i < number; i++) {
    const velocity = { x: Math.random() * baseVelocity.x / 2, y: Math.random() * baseVelocity.y / 2 };
    new AsteroidDebris(world, {
      color: `rgba(100, 100, 100, 1)`,
      position: {
        x: basePosition.x,
        y: basePosition.y,
      },
      lifeTime: 1000,
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
          color: `rgba(170, 170, 170, 1)`,
          position: {
            x: entity.position.x,
            y: entity.position.y,
          },
          velocity: rotateVector(entity.velocity, Math.PI / 4),
          size: newSize,
          mass: newSize
        })
        new Asteroid(world, {
          color: `rgba(170, 170, 170, 1)`,
          position: {
            x: entity.position.x,
            y: entity.position.y,
          },
          velocity:  rotateVector(entity.velocity, -Math.PI / 4),
          size: newSize,
          mass: newSize
        })
      }
      createDebris(entity.size << 0, entity.position, entity.velocity);
      entity.destroy()
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

world.start()