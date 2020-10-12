import { Addon, Entity } from './ecs'

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
export class Loop extends Addon {
  static raf = null;
  static loop = (world) => {
    Loop.raf = requestAnimationFrame(world.update.bind(world));
  }
  static stop = () => {
    cancelAnimationFrame(Loop.raf);
    Loop.raf = null;
  }
  static onInit = (world) => {
    Loop.loop(world);
  }
  static onBeforeUpdate = (world) => {
    Loop.loop(world)
  }
  static get isRunning(){
    return Loop.raf !== null;
  }
}
export class Input extends Addon {
  static keypress = null;
  static keydown = [];
  static mouse = {x: 0, y: 0};
  static INPUT_LEFT = 'ArrowLeft';
  static INPUT_RIGHT = 'ArrowRight';
  static INPUT_UP = 'ArrowUp';
  static INPUT_DOWN = 'ArrowDown';
  static onInit = (world) => {
    document.addEventListener('keydown', evt => {
      if(Input.keydown.indexOf(evt.code) !== -1) return
      Input.keydown = [...Input.keydown, evt.code];
    });
    document.addEventListener('keyup', evt => {
      Input.keydown.splice(Input.keydown.indexOf(evt.code), 1);
    })
    document.addEventListener('mousemove', evt => {
      Input.mouse = {x: evt.clientX, y: evt.clientY};
    });
  }
  static onBeforeUpdate = (world) => {
    Input.keypress = Input.keydown
  }
  static onAfterUpdate = (world) => {
    Input.keypress = null;
  }
  static isPressed = (key) => {
    return Input.keypress.indexOf(key) !== -1
  } 
}
export class Renderer extends Addon {
  static canvas = null;
  static ctx = null;
  static width = 0;
  static height = 0;
  static setup = (canvas, width, height) => {
    Renderer.canvas = canvas
    Renderer.width = width
    Renderer.height = height
    Renderer.ctx = Renderer.canvas.getContext('2d');
    Renderer.canvas.width = Renderer.width * window.devicePixelRatio;
    Renderer.canvas.height = Renderer.height * window.devicePixelRatio;
    Renderer.canvas.style['width'] = Renderer.width;
    Renderer.canvas.style['height'] = Renderer.height;
  }
  static onBeforeUpdate = (world) => {
    Renderer.ctx.clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);
  }
}
export class SaveSystem extends Addon {
  static saveGame = (world, saveName) => {
    const saveFile = {
      timestamp: Date.now(),
      entities: world.entities.map(entity => entity.serialize())
    }
    localStorage.setItem(`gamesave-${saveName}`, JSON.stringify(saveFile))
  }
  static restoreGame = (world, saveName) => {
    const saveFile = localStorage.getItem(`gamesave-${saveName}`)
    const saveData = JSON.parse(saveFile);
    world.entities = []
    saveData.entities.forEach(entityData => {
      new Entity(world).unserialize(entityData)
    })
  }
  static saveData = (name, data) => {
    localStorage.setItem(`data-${name}`, JSON.stringify(data))
  }
  static restoreData = (name) => {
    const savedData = localStorage.getItem(`data-${name}`)
    return savedData ? JSON.parse(savedData) : null
  }
}