import { Entity } from "../../core/ecs";

import {
  Position,
  Velocity,
  Size,
  Controllable,
  AsteroidRenderable,
  SpaceshipRenderable,
  ParticlesRenderable,
  Collision,
  Shield,
  AutoDestroy,
  UIGauge,
  UIGaugeRenderable,
  UITextRenderable,
  UITextBase,
  Score,
  Trail,
} from "./components";

// ====================================
// Game entities
// ====================================

export class SpaceBody extends Entity {
  static name = "SpaceBody";
  static components = [Position, Velocity, Size];
}

export class Asteroid extends SpaceBody {
  static name = "Asteroid";
  static components = [...super.components, Collision, AsteroidRenderable];
}

export class Debris extends SpaceBody {
  static name = "Debris";
  static components = [...super.components, AutoDestroy, ParticlesRenderable];
}

export class Spaceship extends SpaceBody {
  static name = "Spaceship";
  static components = [
    ...super.components,
    Collision,
    Controllable,
    Shield,
    Trail,
    SpaceshipRenderable,
  ];
}

// ====================================
// UI entities
// ====================================

export class UIShieldBar extends Entity {
  static name = "UIShieldBar";
  static components = [UIGauge, UIGaugeRenderable];
}

export class UIText extends Entity {
  static name = "UIText";
  static components = [UITextBase, UITextRenderable];
}

export class UIScore extends Entity {
  static name = "UIScore";
  static components = [UITextBase, UITextRenderable, Score];
}
