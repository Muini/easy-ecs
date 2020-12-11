import { Asteroid, Spaceship } from "../../entities";
export const isSpaceship = (entity) => {
  return entity.constructor === Spaceship;
};
export const isAsteroid = (entity) => {
  return entity.constructor === Asteroid;
};
