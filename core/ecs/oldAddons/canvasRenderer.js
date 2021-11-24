import { Addon } from '../ecs'

export class Renderer extends Addon {
  static canvas = null;
  static ctx = null;
  static width = 0;
  static height = 0;
  static worldScale = 1;
  static setup = (canvas, width, height, worldScale = 1) => {
    Renderer.canvas = canvas
    Renderer.width = width
    Renderer.height = height
    Renderer.worldScale = worldScale
    Renderer.ctx = Renderer.canvas.getContext('2d');
    Renderer.canvas.width = Renderer.width * Renderer.worldScale;
    Renderer.canvas.height = Renderer.height * Renderer.worldScale;
    Renderer.canvas.style['width'] = Renderer.width;
    Renderer.canvas.style['height'] = Renderer.height;
    window.addEventListener('resize', () => {
       Renderer.onResize()
    })
  }
  static onResize = () => {}
  static onBeforeUpdate = (world) => {
    Renderer.ctx.clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);
  }
}