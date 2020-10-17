import { Entity } from '../../core/ecs'

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
  UITextRenderable, 
  UIText, 
  Score } from './components'

// ====================================
// Game entities
// ====================================

export class SpaceBody extends Entity {
  static components = [Position, Velocity, Size]
}

export class Asteroid extends SpaceBody {
  static components = [...super.components, Collision, AsteroidRenderable]
}

export class Debris extends SpaceBody {
  static components = [...super.components, AutoDestroy, DebrisRenderable]
}

export class Spaceship extends SpaceBody {
  static components = [...super.components, Collision, Controllable, Shield, SpaceshipRenderable]
}

// ====================================
// UI entities
// ====================================

export class UIShieldBar extends Entity {
  static components = [UIGauge, UIGaugeRenderable]
}

export class UIHealthBar extends Entity {
  static components = [UIGauge, UIGaugeRenderable]
}

export class UIScore extends Entity {
  static components = [Score, UIText, UITextRenderable]
}