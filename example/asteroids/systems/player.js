import { System } from "../../../core/ecs";
import { Time, Input, Config } from "../../../core/addons";

import {
  Position,
  Velocity,
  Shield,
  Collision,
  Controllable,
} from "../components";

import { UIShieldBar } from "../entities";
import { lerpAngle } from "./utils";

// ====================================
// Player systems
// ====================================

export class SpaceshipMovements extends System {
  dependencies = [Position, Velocity, Controllable];
  onUpdate = (entities) => {
    entities.forEach((entity) => {
      const thrust = Config.player.speed * Time.delta;
      const turnSpeed = Config.player.turn_speed * Time.delta;
      Input.keypress.forEach((key) => {
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
            entity.rotation = lerpAngle(
              entity.rotation,
              -Math.PI / 2,
              turnSpeed
            );
            break;
          case Input.INPUT_DOWN:
            entity.velocity.y += thrust;
            entity.rotation = lerpAngle(
              entity.rotation,
              Math.PI / 2,
              turnSpeed
            );
            break;
        }
      });
    });
  };
}

export class SpaceshipShieldControl extends System {
  dependencies = [Shield, Collision, Controllable];
  onUpdate = (entities) => {
    entities.forEach((entity) => {
      if (Input.isPressed(Input.INPUT_SPACE)) {
        entity.hasShield = true;
      } else {
        entity.hasShield = false;
      }
      if (entity.hasShield) {
        entity.shieldPower -= entity.shieldDrain * Time.delta;
        if (entity.shieldPower <= 0) {
          entity.hasShield = false;
        }
      } else {
        if (entity.shieldPower < 100) {
          entity.shieldPower += entity.shieldRecover * Time.delta;
        }
      }
      entity.shieldPower = Math.min(Math.max(entity.shieldPower, 0), 100);
      entity.mass = entity.hasShield ? 10 * entity.shieldForce : 10;

      // Update UI Shield Bar
      const shieldBars = this.world.getEntitiesOfType(UIShieldBar);
      shieldBars.forEach((shieldBar) => {
        shieldBar.value = entity.shieldPower;
      });
    });
  };
}
