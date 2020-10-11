import { UUID } from './utils';
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
  static onStart = (world) => {
    Loop.raf = requestAnimationFrame(world.update.bind(world));
  }
  static onBeforeUpdate = (world) => {
    Loop.raf = requestAnimationFrame(world.update.bind(world));
  }
  static stop = () => {
    cancelAnimationFrame(Loop.raf);
    Loop.raf = null;
  }
  static get isRunning(){
    return Loop.raf !== null;
  }
}
export class Input extends Addon {
  static keypress = null;
  static keydown = [];
  static mouse = {x: 0, y: 0};
  static INPUT_LEFT = 37;
  static INPUT_RIGHT = 39;
  static INPUT_UP = 38;
  static INPUT_DOWN = 40;
  static onInit = (world) => {
    document.addEventListener('keydown', evt => {
      if(Input.keydown.indexOf(evt.keyCode) !== -1) return
      Input.keydown = [...Input.keydown, evt.keyCode];
    });
    document.addEventListener('keyup', evt => {
      Input.keydown.splice(Input.keydown.indexOf(evt.keyCode), 1);
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
  static onInit = (world) => {
    Renderer.canvas = document.getElementById('game');
    Renderer.ctx = Renderer.canvas.getContext('2d');
    Renderer.width = 512;
    Renderer.height = 512;
    Renderer.canvas.width = Renderer.width * window.devicePixelRatio;
    Renderer.canvas.height = Renderer.height * window.devicePixelRatio;
    Renderer.canvas.style['width'] = Renderer.width;
    Renderer.canvas.style['height'] = Renderer.height;
  }
  static onBeforeUpdate = (world) => {
    Renderer.ctx.clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);
  }
}
export class SaveGame extends Addon {
  static world = null;
  static onInit = (world) => {
    SaveGame.world = world;
  }
  static save = () => {
    const saveFile = {
      id: UUID(),
      timestamp: Date.now(),
      entities: this.world.entities.map(entity => entity.serialize())
    }
    localStorage.setItem(`save${saveFile.id}`, JSON.stringify(saveFile))
    return saveFile.id
  }
  static restore = (id) => {
    const saveFile = localStorage.getItem(`save${id}`)
    const saveData = JSON.parse(saveFile);
    SaveGame.world.entities = []
    saveData.entities.forEach(entityData => {
      new Entity(SaveGame.world).unserialize(entityData)
    })
  }
}