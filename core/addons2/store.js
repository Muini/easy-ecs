import { recoverWorld } from "../ecs2";

export const Store = (function () {
  let _MAXSTATES = 100;
  let _states = [];
  let _currentIndex = 0;
  let _autoApply = false;
  const _apply = (world) => {
    console.log("apply store");
    if (_currentIndex < _states.length - 1) {
      _states.splice(_currentIndex + 1, _states.length);
    }
    if (_states.length > _MAXSTATES) {
      _states.splice(0, 1);
    }
    _currentIndex = _states.length - 1;
    _states.push(JSON.stringify(world));
  };
  return {
    name: "Store",
    set MAXSTATES(nbr) {
      _MAXSTATES = nbr;
    },
    set autoUpdate(yes) {
      _autoApply = yes;
    },
    get states() {
      return _states;
    },
    undo: (world) => {
      if (_currentIndex - 1 < 0) return;
      _currentIndex--;
      const prevWorld = JSON.parse(_states[_currentIndex]);
      recoverWorld(world, prevWorld);
    },
    redo: (world) => {
      if (_currentIndex + 1 > _states.length - 1) return;
      _currentIndex++;
      const nextWorld = JSON.parse(_states[_currentIndex]);
      recoverWorld(world, nextWorld);
    },
    apply: (world) => {
      _apply(world);
    },
    onBeforeUpdate: (world, time) => {
      if (_autoApply) _apply(world);
    },
  };
})();
