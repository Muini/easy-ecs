
import { World } from '../core/ecs';
import { Time, Input, Loop, Renderer, SaveSystem } from '../core/addons';
import { Player, Soldier, PlayerMovement, NPCMovement, CharacterRenderer, Renderable, Controllable } from './game';

Renderer.setup(document.getElementById('game'), 512, 512)

const world = new World({
  addons: [Loop, Time, Input, Renderer, SaveSystem],
  systems: [PlayerMovement, NPCMovement, CharacterRenderer]
});

const player = new Player(world, {
  x: Renderer.canvas.width / 2 << 0,
  y: Renderer.canvas.height / 2 << 0,
  health: 100,
  speed: 0.2,
  size: 10,
})

const soldiers = []
for (let i = 0; i < 4; i++) {
  const soldier = new Soldier(world, {
    color: `rgba(200, 50, 50, 1.0)`,
    x: (Math.random() * Renderer.canvas.width) << 0,
    y: (Math.random() * Renderer.canvas.height) << 0,
    health: 100,
    speed: (Math.random() * 0.05),
    size: 8
  });
  soldiers.push(soldier)
}

world.start()