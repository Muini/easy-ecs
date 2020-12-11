import { Component } from "../../core/ecs";

// ====================================
// Game components
// ====================================

export class Position extends Component {
  static name = "Position";
  static position = { x: 0, y: 0 };
  static rotation = 0;
}

export class Velocity extends Component {
  static name = "Velocity";
  static velocity = { x: 0, y: 0 };
}

export class Size extends Component {
  static name = "Size";
  static size = 10;
}

export class Collision extends Component {
  static name = "Collision";
  static mass = 10;
}

export class CollisionDetected extends Component {
  static name = "CollisionDetected";
  static hitTarget = null; //Entity
  static impulse = 0;
}

export class AutoDestroy extends Component {
  static name = "AutoDestroy";
  static lifeTime = 1500; //ms
  static currentLifeTime = 1500; //ms
}

export class Score extends Component {
  static name = "Score";
  static score = 0;
}

// ====================================
// Player components
// ====================================

export class Controllable extends Component {
  static name = "Controllable";
}

export class Shield extends Component {
  static name = "Shield";
  static hasShield = false;
  static shieldColor = `rgba(100, 150, 255, 1.0)`;
  static shieldRecover = 0.2;
  static shieldDrain = 0.1;
  static shieldPower = 100;
  static shieldForce = 10;
}

// ====================================
// UI components
// ====================================

export class UI extends Component {
  static name = "UI";
  static x = 0;
  static y = 0;
  static width = 0;
  static height = 0;
}

export class UITextBase extends UI {
  static name = "UITextBase";
  static text = "";
  static fontSize = 12;
  static color = `rgba(255, 255, 255, 1.0)`;
}

export class UIGauge extends UI {
  static name = "UIGauge";
  static value = 0;
  static maxValue = 0;
  static color = `rgba(255, 255, 255, 1.0)`;
}

// ====================================
// Renderer components
// ====================================

export class Trail extends Component {
  static trailColor = `rgba(241, 250, 238, .6)`;
  static trailSize = 6;
  static trailLifetime = 3000; //ms
}

export class BaseRenderable extends Component {
  static name = "BaseRenderable";
  static color = `rgba(255, 255, 255, 1.0)`;
}
export class AsteroidRenderable extends BaseRenderable {
  static name = "AsteroidRenderable";
  static type = 0; //0 | 1 | 2
}
export class SpaceshipRenderable extends BaseRenderable {
  static name = "SpaceshipRenderable";
  static shieldAnimTime = 100;
  static shieldCurrentTime = 0;
}
export class ParticlesRenderable extends BaseRenderable {
  static name = "ParticlesRenderable";
}

export class UIRenderable extends Component {
  static name = "UIRenderable";
}
export class UITextRenderable extends UIRenderable {
  static name = "UITextRenderable";
}
export class UIGaugeRenderable extends UIRenderable {
  static name = "UIGaugeRenderable";
}
