
import { World } from '../core/ecs';
import { Time, Input, Loop, Renderer, SaveSystem } from '../core/addons';

import { GlobalMovements, SpaceshipMovements, SpaceshipRenderer } from './asteroids/systems';
import { Spaceship, Asteroid, Projectile } from './asteroids/entities';

Renderer.setup(document.getElementById('game'), 512, 512);

const world = new World({
  addons: [Loop, Time, Input, Renderer, SaveSystem],
  systems: [GlobalMovements, SpaceshipMovements, SpaceshipRenderer]
});

const player = new Spaceship(world, {
  position: {
    x: Renderer.canvas.width / 2 << 0,
    y: Renderer.canvas.height / 2 << 0,
  },
  size: 10,
})

console.log(player)

world.start()