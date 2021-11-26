import { newSystem } from "../ecs";

// 🕹️ Input addon
export const Input = (function () {
  let _keydown = [];
  let _keypress = null;
  let _mouse = [0, 0];

  return {
    name: "Input",
    get mouse() {
      return _mouse;
    },
    get keypress() {
      return _keypress;
    },
    isPressed: (key) => {
      return _keypress.indexOf(key) !== -1;
    },
    system: newSystem({
      name: "input",
      init: () => {
        document.addEventListener("keydown", (evt) => {
          if (_keydown.indexOf(evt.code) !== -1) return;
          _keydown = [..._keydown, evt.code];
        });
        document.addEventListener("keyup", (evt) => {
          _keydown.splice(_keydown.indexOf(evt.code), 1);
        });
        document.addEventListener("mousemove", (evt) => {
          _mouse = [evt.clientX, evt.clientY];
        });
      },
      beforeUpdate: (world) => {
        _keypress = _keydown;
      },
      afterUpdate: (world) => {
        _keypress = null;
      },
    }),
  };
})();
