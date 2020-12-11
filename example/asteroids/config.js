export const config = {
  world: {
    width: 1200,
    height: 1200 * 0.75,
    ratio: (1200 * 0.75) / 1200,
  },
  global: {
    max_velocity: 0.75,
  },
  palette: {
    lightest: `rgba(241, 250, 238, 1)`,
    light: `rgba(168, 218, 220, 1)`,
    medium: `rgba(69, 123, 157, 1)`,
    accentuation: `rgba(230, 57, 70, 1)`,
  },
  player: {
    size: 16,
    mass: 12,
    speed: 0.0005,
    turn_speed: 0.005,
  },
  asteroids: {
    amount: 15,
    min_size: 20,
    max_size: 70,
    max_velocity: 0.05,
  },
};
