import { Component } from '../../core/ecs'

// ====================================
// Shared components
// ====================================

export class Position extends Component{
  static position = {x: 0, y: 0};
  static rotation = 0;
}

export class Velocity extends Component{
  static velocity = {x: 0, y: 0};
}

export class Size extends Component{
  static size = 10;
}

export class Collision extends Component{
  static mass = 10;
}

// ====================================
// Player components
// ====================================

export class Controllable extends Component {}

export class Shield extends Component {
  static hasShield = false;
  static shieldPower = 100;
  static shieldForce = 10;
}

// ====================================
// Renderer components
// ====================================

export class BaseRenderable extends Component {
  static color = `rgba(255, 255, 255, 1.0)`;
}

export class AsteroidRenderable extends BaseRenderable {
  static type = 0 //0 | 1 | 2
}

export class SpaceshipRenderable extends BaseRenderable {}

export class ProjectileRenderable extends BaseRenderable {}