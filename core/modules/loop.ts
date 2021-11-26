import { updateWorld, newSystem } from "../ecs";

// 🔁 Loop addon
export const Loop = (function () {
  let _raf = null;
  let _fps = null;
  let _prevTime = performance.now();
  const _loop = (world) => {
    _raf = requestAnimationFrame((time) => {
      if (_fps) {
        const now = performance.now();
        const elapsed = now - _prevTime;
        if (elapsed > 1 / _fps) {
          _prevTime = now;
          updateWorld(world, time);
        }
      } else {
        updateWorld(world, time);
      }
    });
  };
  const _stop = () => {
    cancelAnimationFrame(_raf);
    _raf = null;
  };
  return {
    name: "Loop",
    get isRunning() {
      return _raf !== null;
    },
    set setFps(fps: number | null) {
      _fps = fps;
    },
    stop: () => {
      _stop();
    },
    system: newSystem({
      name: "loop",
      init: (world) => {
        _loop(world);
      },
      beforeUpdate: (world, dt) => {
        _loop(world);
      },
    }),
  };
})();
