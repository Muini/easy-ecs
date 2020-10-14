import { System } from '../../core/ecs'
import { Time, Input, Renderer, Rules } from '../../core/addons';

import { 
  Position, 
  Velocity, 
  Size, 
  Controllable, 
  AsteroidRenderable, 
  SpaceshipRenderable, 
  Collision, 
  ProjectileRenderable, 
  Shield
} from './components'
import { Asteroid, Spaceship } from './entities';

const MAX_VELOCITY = 0.5;
export class GlobalMovements extends System {
  dependencies = [Position, Size, Velocity]
  onUpdate = (entities) => {
    entities.forEach(entity => {
      // Limit velocity
      entity.velocity.x = entity.velocity.x > MAX_VELOCITY ? MAX_VELOCITY : entity.velocity.x 
      entity.velocity.x = entity.velocity.x < -MAX_VELOCITY ? -MAX_VELOCITY : entity.velocity.x 
      entity.velocity.y = entity.velocity.y > MAX_VELOCITY ? MAX_VELOCITY : entity.velocity.y
      entity.velocity.y = entity.velocity.y < -MAX_VELOCITY ? -MAX_VELOCITY : entity.velocity.y
      entity.position.x += entity.velocity.x * Time.delta;
      entity.position.y += entity.velocity.y * Time.delta;
      // World bounds
      if(entity.position.x + entity.size < 0){
        entity.position.x = (Renderer.width) + entity.size
      }else if(entity.position.x - entity.size > Renderer.width){
        entity.position.x = -entity.size
      }else if(entity.position.y + entity.size < 0){
        entity.position.y = (Renderer.height) + entity.size
      }else if(entity.position.y - entity.size > Renderer.height){
        entity.position.y = -entity.size
      }
    })
  }
}

//https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
function circleIntersect(x1, y1, r1, x2, y2, r2) {
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}
function dot(v1, v2){
  return v1.x * v2.x + v1.y * v2.y
}
export class SpaceBodyCollisions extends System {
  dependencies = [Position, Velocity, Size, Collision]
  onUpdate = (entities) => {
    entities.forEach(entity => {
      let hit = null;
      entities.forEach(otherEntity => {
        if(entity.id !== otherEntity.id){
          const collision = circleIntersect(
            entity.position.x - (entity.size / 2), 
            entity.position.y - (entity.size / 2), 
            entity.size,
            otherEntity.position.x - (otherEntity.size / 2), 
            otherEntity.position.y - (otherEntity.size / 2), 
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

    Rules.notify('collision', { entity, hitEntity, impulse })
  }
}

function shortAngleDist(a0,a1) {
    const max = Math.PI*2;
    const da = Math.sign(a1 - a0)*(Math.abs(a1 - a0) % max);
    return Math.sign(a1 - a0)*(2*Math.abs(da) % max) - da;
}
function lerpAngle(a0,a1,t) {
    return a0 + shortAngleDist(a0,a1)*t;
}

const PLAYER_SPEED = 0.0002
const PLAYER_TURN_SPEED = 0.005
export class SpaceshipMovements extends System {
  dependencies = [Position, Velocity, Controllable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      const thrust = PLAYER_SPEED * Time.delta;
      const turnSpeed = PLAYER_TURN_SPEED * Time.delta;
      Input.keypress.forEach(key => {
        switch (key) {
          case Input.INPUT_LEFT:
            entity.velocity.x -= thrust;
            entity.rotation = lerpAngle(entity.rotation, Math.PI, turnSpeed);
          break;
          case Input.INPUT_RIGHT:
            entity.velocity.x += thrust;
            entity.rotation = lerpAngle(entity.rotation, 0, turnSpeed);
          break;
          case Input.INPUT_UP:
            entity.velocity.y -= thrust;
            entity.rotation = lerpAngle(entity.rotation, -Math.PI / 2, turnSpeed);
          break;
          case Input.INPUT_DOWN:
            entity.velocity.y += thrust;
            entity.rotation = lerpAngle(entity.rotation, Math.PI / 2, turnSpeed);
          break;
        }
      })
    });
  };
}

export class SpaceshipShieldControl extends System {
  dependencies = [Shield, Controllable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      if(Input.isPressed(Input.INPUT_SPACE)){
        entity.hasShield = true
      }else{
        entity.hasShield = false
      }
    })
  }
}

export class SpaceshipRenderer extends System{
  dependencies = [Position, Size, SpaceshipRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.pixelRatio, 
        entity.position.y * Renderer.pixelRatio
      )
      Renderer.ctx.rotate(entity.rotation)
      Renderer.ctx.fillStyle = entity.color
      Renderer.ctx.beginPath()
      const size = entity.size * 2 * Renderer.pixelRatio;
      Renderer.ctx.moveTo(size, 0)
      Renderer.ctx.lineTo(-size, -size/1.5)
      Renderer.ctx.lineTo(-size, size/1.5)
      Renderer.ctx.fill()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class AsteroidRenderer extends System{
  dependencies = [Position, Size, AsteroidRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.pixelRatio, 
        entity.position.y * Renderer.pixelRatio
      )
      Renderer.ctx.rotate(entity.rotation)
      Renderer.ctx.fillStyle = entity.color
      Renderer.ctx.beginPath()
      const size = entity.size * Renderer.pixelRatio;
      Renderer.ctx.arc(-size / 2, -size / 2, size, 0, 2 * Math.PI);
      Renderer.ctx.fill()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}