// 🔁 Loop addon
export const Loop = (function () {
  let _raf = null;
  let _fps = null;
  let _prevTime = performance.now();
  let _update = (time: number) => {};
  const _loop = () => {
    _raf = requestAnimationFrame((time) => {
      if (_fps != null) {
        const now = performance.now();
        const elapsed = now - _prevTime;
        if (elapsed > (1 / _fps) * 1000) {
          _prevTime = now;
          _update(time);
        }
      } else {
        _update(time);
      }
      _loop();
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
    set update(fn: (time: number) => void) {
      _update = fn;
    },
    setFps(fps: number | null) {
      _fps = fps;
    },
    stop: () => {
      _stop();
    },
    start: () => {
      _loop();
    },
  };
})();
