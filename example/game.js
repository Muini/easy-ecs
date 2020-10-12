import { Entity, Component, System } from '../core/ecs'
import { Input, Time, Renderer } from '../core/addons'

export class Position extends Component{
  static x = 0;
  static y = 0;
  static rotation = 0;
}

export class Movable extends Component{
  static speed = 0;
}

export class Health extends Component{
  static health = 0;
  static maxHealth = 100;
}

export class Renderable extends Component {
  static color = `rgba(255, 255, 255, 1.0)`;
  static size = 8;
}
export class Controllable extends Component {}
export class NPC extends Component {}

export class Character extends Entity {
  static components = [Position, Movable, Health, Renderable]
}

export class Player extends Character {
  static components = [...super.components, Controllable]
}

export class Soldier extends Character {
  static components = [...super.components, NPC]
}

export class NPCMovement extends System {
  dependencies = [Position, Movable, NPC];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      entity.x += entity.speed * Time.delta;
    })
  };
}

export class PlayerMovement extends System {
  dependencies = [Controllable, Movable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      const amount = entity.speed * Time.delta;
      Input.keypress.forEach(key => {
        switch (key) {
          case Input.INPUT_LEFT:
            entity.x -= amount;
            entity.rotation = Math.PI;
          break;
          case Input.INPUT_RIGHT:
            entity.x += amount;
            entity.rotation = 0;
          break;
          case Input.INPUT_UP:
            entity.y -= amount;
            entity.rotation = -Math.PI / 2;
          break;
          case Input.INPUT_DOWN:
            entity.y += amount;
            entity.rotation = Math.PI / 2;
          break;
        }
      })
    });
  };
}

export class CharacterRenderer extends System{
  dependencies = [Renderable];
  onUpdate = (entities) => {
    entities.forEach(entity => {
      Renderer.ctx.translate(entity.x, entity.y)
      Renderer.ctx.rotate(entity.rotation)
      Renderer.ctx.fillStyle = entity.color
      Renderer.ctx.beginPath()
      Renderer.ctx.moveTo(entity.size, 0)
      Renderer.ctx.lineTo(-entity.size, -entity.size/1.5)
      Renderer.ctx.lineTo(-entity.size, entity.size/1.5)
      Renderer.ctx.fill()
      Renderer.ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
  }
}