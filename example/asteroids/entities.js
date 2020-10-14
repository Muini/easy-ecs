import { Entity } from '../../core/ecs'

import { Position, Velocity, Size, Controllable, AsteroidRenderable, SpaceshipRenderable, Collision, ProjectileRenderable, Shield } from './components'

export class SpaceBody extends Entity {
  static components = [Position, Velocity, Size, Collision]
}

export class Asteroid extends SpaceBody {
  static components = [...super.components, AsteroidRenderable]
  onDestroy(){
    if(this.size > 20){
      new Asteroid(this.world, {
        position: { x: this.position.x, y: this.position.y }
      })
    }
  }
}

export class Spaceship extends SpaceBody {
  static components = [...super.components, Controllable, Shield, SpaceshipRenderable]
}

export class Projectile extends SpaceBody {
  static components = [...super.components, ProjectileRenderable]
}