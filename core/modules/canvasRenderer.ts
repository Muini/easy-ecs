import { newSystem } from "../ecs";

//🖼️ Renderer addon
export const CanvasRenderer = (function () {
  let _canvas = null;
  let _ctx = null;
  let _width = 0;
  let _height = 0;
  let _worldScale = 1;
  const _onResize = () => {};
  return {
    name: "Renderer",
    get ctx() {
      return _ctx;
    },
    get width() {
      return _width;
    },
    get height() {
      return _height;
    },
    get worldScale() {
      return _worldScale;
    },
    setup: (canvas, width, height, worldScale = 1) => {
      _canvas = canvas;
      _width = width;
      _height = height;
      _worldScale = worldScale;
      _ctx = _canvas.getContext("2d");
      _canvas.width = _width * _worldScale;
      _canvas.height = _height * _worldScale;
      _canvas.style["width"] = _width;
      _canvas.style["height"] = _height;
      window.addEventListener("resize", () => {
        _onResize();
      });
    },
    system: newSystem({
      name: "canvas-renderer",
      beforeUpdate: (world) => {
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
      },
    }),
  };
})();
