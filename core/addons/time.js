import { Addon } from '../ecs'

export class Time extends Addon {
  static time = 0;
  static delta = 0;
  static elapsed = 0;
  static onBeforeUpdate = (world, time) => {
    Time.delta = time - Time.time;
    Time.time = time;
    Time.elapsed += Time.delta;
  }
}