import { Entity } from '../../core/ecs'

import { Position, Velocity, Size, Controllable, AsteroidRenderable, SpaceshipRenderable, Collision, Shield, AutoDestroy } from './components'

export class SpaceBody extends Entity {
  static components = [Position, Velocity, Size]
}

export class Asteroid extends SpaceBody {
  static components = [...super.components, Collision, AsteroidRenderable]
}

export class AsteroidDebris extends SpaceBody {
  static components = [...super.components, AutoDestroy, AsteroidRenderable]
}

export class Spaceship extends SpaceBody {
  static components = [...super.components, Collision, Controllable, Shield, SpaceshipRenderable]
}