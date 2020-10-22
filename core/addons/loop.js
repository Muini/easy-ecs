import { Addon } from '../ecs'

let _raf = null;
export class Loop extends Addon {
  static loop = (world) => {
    _raf = requestAnimationFrame(world.update.bind(world));
  }
  static stop = () => {
    cancelAnimationFrame(_raf);
    _raf = null;
  }
  static onInit = (world) => {
    Loop.loop(world);
  }
  static onBeforeUpdate = (world) => {
    Loop.loop(world)
  }
  static get isRunning(){
    return _raf !== null;
  }
}