import { System } from '../../core/ecs'
import { Time, Input, Renderer } from '../../core/addons';

import { 
  Position, 
  Velocity, 
  Size, 
  Controllable, 
  AsteroidRenderable, 
  SpaceshipRenderable, 
  Collision, 
  ProjectileRenderable 
} from './components'

export class GlobalMovements extends System {
  dependencies = [Position, Velocity]
  onUpdate = (entities) => {
    entities.forEach(entity => {
      entity.position.x += entity.velocity.x * Time.delta;
      entity.position.y += entity.velocity.y * Time.delta;
      // World bounds
      if(entity.position.x < 0){
        entity.position.x = Renderer.width * Renderer.pixelRatio
      }else if(entity.position.x > Renderer.width * Renderer.pixelRatio){
        entity.position.x = 0
      }else if(entity.position.y < 0){
        entity.position.y = Renderer.height * Renderer.pixelRatio
      }else if(entity.position.y > Renderer.height * Renderer.pixelRatio){
        entity.position.y = 0
      }
    })
  }
}

export class SpaceshipMovements extends System {
  dependencies = [Position, Velocity, Controllable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      const thrust = 0.01;
      Input.keypress.forEach(key => {
        switch (key) {
          case Input.INPUT_LEFT:
            entity.velocity.x -= thrust;
            entity.rotation = Math.PI;
          break;
          case Input.INPUT_RIGHT:
            entity.velocity.x += thrust;
            entity.rotation = 0;
          break;
          case Input.INPUT_UP:
            entity.velocity.y -= thrust;
            entity.rotation = -Math.PI / 2;
          break;
          case Input.INPUT_DOWN:
            entity.velocity.y += thrust;
            entity.rotation = Math.PI / 2;
          break;
        }
      })
    });
  };
}

export class SpaceshipRenderer extends System{
  dependencies = [Position, Size, SpaceshipRenderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(entity.position.x, entity.position.y)
      Renderer.ctx.rotate(entity.rotation)
      // Renderer.ctx.fillStyle = entity.color
      Renderer.ctx.fillStyle = `rgba(255, 255, 255, 1.0)`
      Renderer.ctx.beginPath()
      const size = entity.size * Renderer.pixelRatio;
      Renderer.ctx.moveTo(size, 0)
      Renderer.ctx.lineTo(-size, -size/1.5)
      Renderer.ctx.lineTo(-size, size/1.5)
      Renderer.ctx.fill()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}