import { System } from '../../../core/ecs'
import { Time, Renderer } from '../../../core/addons';

import { 
  Position,
  Velocity,
  Size,
  Collision,
  AutoDestroy,
} from '../components'

import { Debris, Asteroid, Spaceship, UIScore } from '../entities'

import { MAX_GLOBAL_VELOCITY, PALETTE, ASTEROIDS_MIN_SIZE } from '../config'

// ====================================
// Game systems
// ====================================

export class GlobalMovements extends System {
  dependencies = [Position, Size, Velocity]
  onUpdate = (entities) => {
    entities.forEach(entity => {
      // Limit velocity
      entity.velocity.x = entity.velocity.x > MAX_GLOBAL_VELOCITY ? MAX_GLOBAL_VELOCITY : entity.velocity.x 
      entity.velocity.x = entity.velocity.x < -MAX_GLOBAL_VELOCITY ? -MAX_GLOBAL_VELOCITY : entity.velocity.x 
      entity.velocity.y = entity.velocity.y > MAX_GLOBAL_VELOCITY ? MAX_GLOBAL_VELOCITY : entity.velocity.y
      entity.velocity.y = entity.velocity.y < -MAX_GLOBAL_VELOCITY ? -MAX_GLOBAL_VELOCITY : entity.velocity.y
      // Apply velocity to position
      entity.position.x += entity.velocity.x * Time.delta;
      entity.position.y += entity.velocity.y * Time.delta;
      // World bounds
      if(entity.position.x /*+ entity.size*/ < 0){
        entity.position.x = (Renderer.width)/* + entity.size*/
      }else if(entity.position.x /*- entity.size*/ > Renderer.width){
        // entity.position.x = -entity.size
        entity.position.x = 0
      }else if(entity.position.y /*+ entity.size*/ < 0){
        entity.position.y = (Renderer.height) /*+ entity.size*/
      }else if(entity.position.y /*- entity.size*/ > Renderer.height){
        // entity.position.y = -entity.size
        entity.position.y = 0
      }
    })
  }
}

const isSpaceship = (entity) => { return entity.constructor === Spaceship }
const isAsteroid = (entity) => { return entity.constructor === Asteroid }
//https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
function circleIntersect(x1, y1, r1, x2, y2, r2) {
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}
function dot(v1, v2){
  return v1.x * v2.x + v1.y * v2.y
}
const rotateVector = (v, angle) => {
  const newV = {x: v.x, y: v.y}
  newV.x = v.x*Math.cos(angle) - v.y*Math.sin(angle);
  newV.y = v.x*Math.sin(angle) + v.y*Math.cos(angle);
  return newV
}
const createParticles = (world, number, basePosition, baseVelocity, color) => {
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
export class SpaceBodyCollisions extends System {
  dependencies = [Position, Velocity, Size, Collision]
  onUpdate = (entities) => {
    entities.forEach(entity => {
      let hit = null;
      entities.forEach(otherEntity => {
        if(entity.id !== otherEntity.id){
          const collision = circleIntersect(
            entity.position.x, 
            entity.position.y, 
            entity.size,
            otherEntity.position.x, 
            otherEntity.position.y, 
            otherEntity.size
          );
          if(collision){
            hit = otherEntity
          }
        }
      })
      if(hit)
        this.onCollision(entity, hit);
    })
  }
  onCollision = (entity, hitEntity) => {
    const collision = {
      x: hitEntity.position.x - entity.position.x, 
      y: hitEntity.position.y - entity.position.y
    };
    const distance = Math.sqrt(
      (hitEntity.position.x-entity.position.x) * (hitEntity.position.x-entity.position.x) + (hitEntity.position.y-entity.position.y) * (hitEntity.position.y-entity.position.y)
    );
    const hitNormal = {x: collision.x / distance, y: collision.y / distance};
    const relativeVelocity = {
      x: entity.velocity.x - hitEntity.velocity.x, 
      y: entity.velocity.y - hitEntity.velocity.y
    }
    const speed = dot(relativeVelocity, hitNormal);
    if (speed < 0){
        return;
    }
    const impulse = 2 * speed / (entity.mass + hitEntity.mass);
    entity.velocity.x -= (impulse * hitEntity.mass * hitNormal.x);
    entity.velocity.y -= (impulse * hitEntity.mass * hitNormal.y);
    hitEntity.velocity.x += (impulse * entity.mass * hitNormal.x);
    hitEntity.velocity.y += (impulse * entity.mass * hitNormal.y);

    this.onHit(entity, hitEntity, impulse)
  }
  onHit = (entity, hitEntity, impulse) => {
    // If spaceship hits an asteroid
    if(
      (isAsteroid(entity) && isSpaceship(hitEntity)) ||
      (isAsteroid(hitEntity) && isSpaceship(entity))
    ){
      const spaceship = isSpaceship(entity) ? entity : hitEntity;
      if(spaceship.hasShield){
        impulse *= spaceship.shieldForce;
        const bonus = impulse * 1000 << 0;
        createParticles(this.world, bonus << 0, entity.position, { x: entity.velocity.x * 1.5, y: entity.velocity.y * 1.5 }, PALETTE.lightest);
        this.addToScore(bonus);
      }else{
        const malus = impulse * 1000 << 0;
        createParticles(this.world, malus, entity.position, { x: entity.velocity.x * 1.5, y: entity.velocity.y * 1.5 }, PALETTE.accentuation);
        this.addToScore(-malus);
      }
    }
    const shouldBreakEntity = impulse * 1000 > hitEntity.mass;
    const shouldBreakHitEntity = impulse * 1000 > entity.mass;
    if(shouldBreakEntity){
      this.onBreak(hitEntity);
    }
    if(shouldBreakHitEntity){
      this.onBreak(entity);
    }
  }
  onBreak = (entity) => {
    if(isAsteroid(entity)){
      // Break asteroid in half
      const shouldSplit = entity.size > (ASTEROIDS_MIN_SIZE / 2)
      if(shouldSplit){
        const newSize = entity.size / 2
        new Asteroid(this.world, {
          color: PALETTE.light,
          position: {
            x: entity.position.x,
            y: entity.position.y,
          },
          velocity: rotateVector(entity.velocity, Math.PI / 4),
          size: newSize,
          mass: newSize
        })
        new Asteroid(this.world, {
          color: PALETTE.light,
          position: {
            x: entity.position.x,
            y: entity.position.y,
          },
          velocity: rotateVector(entity.velocity, -Math.PI / 4),
          size: newSize,
          mass: newSize
        })
      }
      createParticles(this.world, entity.size << 0, entity.position, entity.velocity, PALETTE.medium);
      const bonus = entity.size / 10 << 0;
      this.addToScore(bonus)
      entity.destroy()
    }else if(isSpaceship(entity)){
      const malus = 20;
      createParticles(this.world, malus, entity.position, entity.velocity, PALETTE.accentuation);
      this.addToScore(-malus)
    }
  }
  addToScore = (points) => {
    // Update UI Score
    const scores = this.world.getEntitiesOfType(UIScore)
    scores.forEach(score => {
      score.score += points;
      if(score.score < 0) score.score = 0;
      score.text = `${score.score}`;
    })
  }
}

export class AutoDestroySystem extends System{
  dependencies = [AutoDestroy];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      entity.currentLifeTime -= Time.delta;
      if(entity.currentLifeTime <= 0){
        entity.destroy();
      }
    })
  }
}