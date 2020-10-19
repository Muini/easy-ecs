import { System } from '../../core/ecs'
import { Time, Input, Renderer, Rules } from '../../core/addons';

import { 
  Position, 
  Velocity, 
  Size, 
  Controllable, 
  AsteroidRenderable, 
  SpaceshipRenderable, 
  DebrisRenderable,
  Collision,
  Shield,
  AutoDestroy,
  UIGauge,
  UIGaugeRenderable,
  UIText,
  UITextRenderable
} from './components'

// ====================================
// Game systems
// ====================================

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
      // Apply velocity to position
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

    Rules.notify('collision', { entity, hitEntity, impulse })
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

// ====================================
// Player systems
// ====================================

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
  dependencies = [Shield, Collision, Controllable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      if(Input.isPressed(Input.INPUT_SPACE)){
        entity.hasShield = true;
      }else{
        entity.hasShield = false;
      }
      if(entity.hasShield){
        entity.shieldPower -= entity.shieldDrain * Time.delta;
        if(entity.shieldPower <= 0){
          entity.hasShield = false;
        }
      }else{
        if(entity.shieldPower < 100){
          entity.shieldPower += entity.shieldRecover * Time.delta;
        }
      }
      entity.shieldPower = Math.min(Math.max(entity.shieldPower, 0), 100);
      entity.mass = entity.hasShield ? 10 * entity.shieldForce : 10;

      Rules.notify('shield.update', entity.shieldPower);
    })
  }
}

// ====================================
// Renderer systems
// ====================================

export class SpaceshipRenderer extends System{
  dependencies = [Position, Size, Shield, SpaceshipRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.pixelRatio, 
        entity.position.y * Renderer.pixelRatio
      )
      Renderer.ctx.rotate(entity.rotation)
      
      Renderer.ctx.beginPath()
      Renderer.ctx.fillStyle = entity.shieldColor
      Renderer.ctx.arc(0, 0, 2, 0, 2 * Math.PI);
      Renderer.ctx.fill()
      Renderer.ctx.closePath()
      // Spaceship
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.beginPath()
      const spaceshipSize = entity.size * Renderer.pixelRatio;
      Renderer.ctx.moveTo(-spaceshipSize / 2, -spaceshipSize / 2)
      Renderer.ctx.lineTo(-spaceshipSize / 2, spaceshipSize / 2)
      Renderer.ctx.lineTo(spaceshipSize, 0)
      Renderer.ctx.fill()
      Renderer.ctx.closePath()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
      // Shield
      if(!entity.hasShield) return
      Renderer.ctx.translate(
        entity.position.x * Renderer.pixelRatio, 
        entity.position.y * Renderer.pixelRatio
      )
      Renderer.ctx.lineWidth = 1 * Renderer.pixelRatio;
      Renderer.ctx.strokeStyle = entity.shieldColor
      Renderer.ctx.beginPath()
      const shieldSize = entity.size * Renderer.pixelRatio;
      Renderer.ctx.arc(0, 0, shieldSize, 0, 2 * Math.PI);
      Renderer.ctx.stroke()
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
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.beginPath()
      const size = entity.size * Renderer.pixelRatio;
      Renderer.ctx.arc(0, 0, size, 0, 2 * Math.PI);
      Renderer.ctx.fill()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class DebrisRenderer extends System{
  dependencies = [Position, Size, DebrisRenderable, AutoDestroy];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.pixelRatio, 
        entity.position.y * Renderer.pixelRatio
      )
      const lifeTimeRatio = entity.currentLifeTime / entity.lifeTime;
      Renderer.ctx.rotate(entity.rotation)
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.globalAlpha = lifeTimeRatio;
      Renderer.ctx.beginPath()
      const size = entity.size * Renderer.pixelRatio * lifeTimeRatio;
      Renderer.ctx.arc(0, 0, size, 0, 2 * Math.PI);
      Renderer.ctx.fill()
      Renderer.ctx.globalAlpha = 1;
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class UITextRenderer extends System{
  dependencies = [UIText, UITextRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.x * Renderer.pixelRatio, 
        entity.y * Renderer.pixelRatio
      )
      Renderer.ctx.font = `${entity.fontSize * Renderer.pixelRatio}px Helvetica`
      Renderer.ctx.fillStyle = entity.color
      Renderer.ctx.fillText(entity.text, 0, 0)
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class UIGaugeRenderer extends System{
  dependencies = [UIGauge, UIGaugeRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.x * Renderer.pixelRatio, 
        entity.y * Renderer.pixelRatio
      )
      const width = entity.width * Renderer.pixelRatio;
      const height = entity.height * Renderer.pixelRatio;
      const currentPercent = entity.value / entity.maxValue;
      const gap = 2 * Renderer.pixelRatio;
      // Inner
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.beginPath();
      Renderer.ctx.rect(gap, gap, (width - (gap * 2)) * currentPercent, (height - (gap * 2)));
      Renderer.ctx.fill();
      // Outer
      Renderer.ctx.lineWidth = 1 * Renderer.pixelRatio;
      Renderer.ctx.strokeStyle = currentPercent <= 0 ? `rgba(255, 50, 20, 1.0)` : `rgba(255, 255, 255, 1.0)`;
      Renderer.ctx.beginPath();
      Renderer.ctx.rect(0, 0, width, height);
      Renderer.ctx.stroke();

      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}