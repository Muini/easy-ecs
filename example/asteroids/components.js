import { Component } from '../../core/ecs'

// ====================================
// Game components
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

export class CollisionDetected extends Component{
  static hitTarget = null; //Entity
  static impulse = 0;
}

export class AutoDestroy extends Component {
  static lifeTime = 1500; //ms
  static currentLifeTime = 1500; //ms
}

export class Score extends Component {
  static score = 0;
}

// ====================================
// Player components
// ====================================

export class Controllable extends Component {}

export class Shield extends Component {
  static hasShield = false;
  static shieldColor = `rgba(100, 150, 255, 1.0)`;
  static shieldRecover = 0.2;
  static shieldDrain = 0.1;
  static shieldPower = 100;
  static shieldForce = 20;
}

// ====================================
// UI components
// ====================================

export class UI extends Component {
  static x = 0;
  static y = 0;
  static width = 0;
  static height = 0;
}

export class UIText extends UI {
  static text = '';
  static fontSize = 12;
  static color = `rgba(255, 255, 255, 1.0)`;
}

export class UIGauge extends UI {
  static value = 0;
  static maxValue = 0;
  static color = `rgba(255, 255, 255, 1.0)`;
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
export class DebrisRenderable extends BaseRenderable {}

export class UIRenderable extends Component {}
export class UITextRenderable extends UIRenderable {}
export class UIGaugeRenderable extends UIRenderable {}