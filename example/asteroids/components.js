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
  static type = 'circle'
  static radius = 10
}

// ====================================
// Player components
// ====================================

export class Controllable extends Component {}

// ====================================
// Renderer components
// ====================================

export class Renderable extends Component {
  static color = `rgba(255, 255, 255, 1.0)`;
}

export class AsteroidRenderable extends Renderable {
  static type = 0 //0 | 1 | 2
}

export class SpaceshipRenderable extends Renderable {
  static test =  2
}

export class ProjectileRenderable extends Renderable {}