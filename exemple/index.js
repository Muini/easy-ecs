
import { World } from '../core/ecs';
import { Time, Input, Loop, Renderer, SaveGame } from '../core/addons';
import { Player, Soldier, PlayerMovement, NPCMovement, CharacterRenderer } from './game';

const world = new World({
  addons: [Loop, Time, Input, Renderer, SaveGame],
  systems: [PlayerMovement, NPCMovement, CharacterRenderer]
});

const player = new Player(world, {
  x: Renderer.canvas.width / 2 << 0,
  y: Renderer.canvas.height / 2 << 0,
  health: 100,
  speed: 0.2,
  size: 10,
})

for (let i = 0; i < 4; i++) {
  new Soldier(world, {
    color: `rgba(200, 50, 50, 1.0)`,
    x: (Math.random() * Renderer.canvas.width) << 0,
    y: (Math.random() * Renderer.canvas.height) << 0,
    health: 100,
    speed: (Math.random() * 0.1),
    size: 8
  });
}

world.start()

setTimeout(_ => {
  const id = SaveGame.save()
  setTimeout(_ => {
    SaveGame.restore(id)
  }, 2000)
}, 300)