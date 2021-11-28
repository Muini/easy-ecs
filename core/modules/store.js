import { recoverWorld } from "../ecs2";
import { deepclone } from "../ecs/utils";

// 📑 Store addon
export const Store = (function () {
  let _MAXSTATES = 100;
  let _states = [];
  let _currentIndex = 0;
  let _autoApply = false;
  const _apply = (world) => {
    if (_currentIndex < _states.length - 1) {
      _states.splice(_currentIndex + 1, _states.length);
    }
    if (_states.length > _MAXSTATES) {
      _states.splice(0, 1);
    }
    _states.push(deepclone(world));
    _currentIndex = _states.length - 1;
  };
  return {
    name: "Store",
    set maxStates(nbr) {
      _MAXSTATES = nbr;
    },
    get maxStates() {
      return _MAXSTATES;
    },
    set autoUpdate(yes) {
      _autoApply = yes;
    },
    get autoUpdate() {
      return _autoApply;
    },
    getStates() {
      return _states;
    },
    undo: (world) => {
      if (_currentIndex - 1 < 0) return;
      _currentIndex--;
      const prevWorld = _states[_currentIndex];
      recoverWorld(world, prevWorld);
    },
    redo: (world) => {
      if (_currentIndex + 1 > _states.length - 1) return;
      _currentIndex++;
      const nextWorld = _states[_currentIndex];
      recoverWorld(world, nextWorld);
    },
    apply: (world) => {
      _apply(world);
    },
    onBeforeUpdate: (world, dt) => {
      if (_autoApply) _apply(world);
    },
  };
})();
