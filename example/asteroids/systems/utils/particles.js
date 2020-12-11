import { rotateVector } from "./index";
import { Debris } from "../../entities";

export const createParticles = (
  world,
  number,
  basePosition,
  baseVelocity,
  color
) => {
  for (let i = 0; i < number; i++) {
    const velocity = {
      x: (Math.random() * baseVelocity.x) / 2,
      y: (Math.random() * baseVelocity.y) / 2,
    };
    new Debris(world, {
      color: color,
      position: {
        x: basePosition.x,
        y: basePosition.y,
      },
      lifeTime: (500 + Math.random() * 1000) << 0,
      velocity: rotateVector(velocity, Math.random() * Math.PI * 2),
      size: 1.5,
    });
  }
};
