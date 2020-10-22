import { System } from '../../../core/ecs'
import { Time, Renderer } from '../../../core/addons';

import { 
  Position,
  Size, 
  AsteroidRenderable, 
  SpaceshipRenderable, 
  ParticlesRenderable,
  Shield,
  AutoDestroy,
  UIGauge,
  UIGaugeRenderable,
  UITextBase,
  UITextRenderable,
  Trail,
} from '../components'
import { Debris } from '../entities';

// ====================================
// Renderer systems
// ====================================

export class TrailSystem extends System{
  dependencies = [Position, Trail]
  onUpdate = (entities) => {
    entities.forEach(entity => {
      new Debris(this.world, {
        color: entity.trailColor,
        position: {
          x: entity.position.x,
          y: entity.position.y,
        },
        lifeTime: entity.trailLifetime,
        velocity: {x: 0, y: 0},
        size: entity.trailSize,
      })
    })
  }
}

export class SpaceshipRenderer extends System{
  dependencies = [Position, Size, Shield, SpaceshipRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.worldScale, 
        entity.position.y * Renderer.worldScale
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
      const spaceshipSize = entity.size * Renderer.worldScale;
      Renderer.ctx.moveTo(-spaceshipSize / 2, -spaceshipSize / 2)
      Renderer.ctx.lineTo(-spaceshipSize / 2, spaceshipSize / 2)
      Renderer.ctx.lineTo(spaceshipSize, 0)
      Renderer.ctx.fill()
      Renderer.ctx.closePath()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
      // Shield
      if(entity.hasShield){
        entity.shieldCurrentTime += Time.delta;
        if(entity.shieldCurrentTime > entity.shieldAnimTime) entity.shieldCurrentTime = entity.shieldAnimTime;
      }else{
        entity.shieldCurrentTime -= Time.delta * 3;
        if(entity.shieldCurrentTime < 0) entity.shieldCurrentTime = 0;
      }
      const currentTime = entity.shieldCurrentTime / entity.shieldAnimTime;
      const currentAnimScale = ((1 - currentTime) * 2);
      const shieldSize = (entity.size * Renderer.worldScale) + (currentAnimScale * 4);
      Renderer.ctx.translate(
        entity.position.x * Renderer.worldScale, 
        entity.position.y * Renderer.worldScale
      )
      Renderer.ctx.lineWidth = (2 * Renderer.worldScale) + (currentAnimScale * 2);
      Renderer.ctx.strokeStyle = entity.shieldColor
      Renderer.ctx.beginPath()
      Renderer.ctx.globalAlpha = currentTime;
      Renderer.ctx.arc(0, 0, shieldSize, 0, 2 * Math.PI);
      Renderer.ctx.stroke()
      Renderer.ctx.globalAlpha = 1;
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class AsteroidRenderer extends System{
  dependencies = [Position, Size, AsteroidRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.worldScale, 
        entity.position.y * Renderer.worldScale
      )
      Renderer.ctx.rotate(entity.rotation)
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.beginPath()
      const size = entity.size * Renderer.worldScale;
      Renderer.ctx.arc(0, 0, size, 0, 2 * Math.PI);
      Renderer.ctx.fill()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class ParticlesRenderer extends System{
  dependencies = [Position, Size, ParticlesRenderable, AutoDestroy];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.position.x * Renderer.worldScale, 
        entity.position.y * Renderer.worldScale
      )
      const lifeTimeRatio = entity.currentLifeTime / entity.lifeTime;
      Renderer.ctx.rotate(entity.rotation)
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.globalAlpha = lifeTimeRatio;
      Renderer.ctx.beginPath()
      const size = entity.size * Renderer.worldScale * lifeTimeRatio;
      Renderer.ctx.arc(0, 0, size, 0, 2 * Math.PI);
      Renderer.ctx.fill()
      Renderer.ctx.globalAlpha = 1;
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}

export class UITextRenderer extends System{
  dependencies = [UITextBase, UITextRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(
        entity.x * Renderer.width * Renderer.worldScale, 
        entity.y * Renderer.height * Renderer.worldScale
      )
      Renderer.ctx.font = `${entity.fontSize}px Helvetica`
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
        entity.x * Renderer.width * Renderer.worldScale, 
        entity.y * Renderer.height * Renderer.worldScale
      )
      const width = entity.width * Renderer.width * Renderer.worldScale;
      const height = entity.height * Renderer.height * Renderer.worldScale;
      const currentPercent = entity.value / entity.maxValue;
      const gap = 2 * Renderer.worldScale;
      // Inner
      Renderer.ctx.fillStyle = entity.color;
      Renderer.ctx.beginPath();
      Renderer.ctx.rect(gap, gap, (width - (gap * 2)) * currentPercent, (height - (gap * 2)));
      Renderer.ctx.fill();
      // Outer
      Renderer.ctx.lineWidth = 1 * Renderer.worldScale;
      Renderer.ctx.strokeStyle = currentPercent <= 0 ? `rgba(255, 50, 20, 1.0)` : `rgba(255, 255, 255, 1.0)`;
      Renderer.ctx.beginPath();
      Renderer.ctx.rect(0, 0, width, height);
      Renderer.ctx.stroke();

      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}