export const Time = (function () {
  let _time = 0;
  let _delta = 0;
  let _elapsed = 0;
  return {
    name: "Time",
    get time() {
      return _time;
    },
    get delta() {
      return _delta;
    },
    get elapsed() {
      return _elapsed;
    },
    onBeforeUpdate: (world, time) => {
      _delta = time - _time;
      _time = time;
      _elapsed += _delta;
    },
  };
})();
