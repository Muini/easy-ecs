import { updateWorld } from "../ecs2";

// 🔁 Loop addon
export const Loop = (function () {
  let _raf = null;
  const _loop = (world) => {
    _raf = requestAnimationFrame((time) => {
      updateWorld(world, time);
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
    onBeforeUpdate: (world, dt) => {
      _loop(world);
    },
    stop: () => {
      _stop();
    },
  };
})();
