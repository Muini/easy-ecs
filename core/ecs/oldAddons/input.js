import { Addon } from "../ecs";

let _keydown = [];
export class Input extends Addon {
  static keypress = null;
  static mouse = { x: 0, y: 0 };
  static INPUT_LEFT = "ArrowLeft";
  static INPUT_RIGHT = "ArrowRight";
  static INPUT_UP = "ArrowUp";
  static INPUT_DOWN = "ArrowDown";
  static INPUT_SPACE = "Space";
  static onInit = (world) => {
    document.addEventListener("keydown", (evt) => {
      if (_keydown.indexOf(evt.code) !== -1) return;
      _keydown = [..._keydown, evt.code];
    });
    document.addEventListener("keyup", (evt) => {
      _keydown.splice(_keydown.indexOf(evt.code), 1);
    });
    document.addEventListener("mousemove", (evt) => {
      Input.mouse = { x: evt.clientX, y: evt.clientY };
    });
  };
  static onBeforeUpdate = (world) => {
    Input.keypress = _keydown;
  };
  static onAfterUpdate = (world) => {
    Input.keypress = null;
  };
  static isPressed = (key) => {
    return Input.keypress.indexOf(key) !== -1;
  };
}
