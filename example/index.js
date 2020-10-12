
import { World } from '../core/ecs';
import { Time, Input, Loop, Renderer, SaveSystem } from '../core/addons';
import { Player, Soldier, PlayerMovement, NPCMovement, CharacterRenderer } from './game';

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
  const now = performance.now()
  SaveSystem.saveGame(world, 'test')
  console.log('Game saved in', performance.now() - now, 'ms')
  setTimeout(_ => {
    const now = performance.now()
    SaveSystem.restoreGame(world, 'test')
    console.log('Game restored in', performance.now() - now, 'ms')
  }, 2000)
}, 1000)