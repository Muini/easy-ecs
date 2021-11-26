import { recoverWorld } from "../ecs";

// 💾 SaveSystem addon
export const SaveSystem = (function () {
  return {
    name: "SaveSystem",
    saveWorld: (saveName, world) => {
      const saveFile = {
        name: saveName,
        timestamp: Date.now(),
        world: world,
      };
      localStorage.setItem(`worldsave-${saveName}`, JSON.stringify(saveFile));
      return saveFile;
    },
    restoreWorld: (saveName, world) => {
      const savedFile = localStorage.getItem(`worldsave-${saveName}`);
      const savedData = JSON.parse(savedFile);
      const savedWorld = savedData.world;
      recoverWorld(world, savedWorld);
    },
    saveData: (name, data) => {
      localStorage.setItem(
        `data-${name}`,
        typeof data === "string" ? data : JSON.stringify(data)
      );
    },
    restoreData: (name) => {
      const savedData = localStorage.getItem(`data-${name}`);
      return savedData ? JSON.parse(savedData) : null;
    },
  };
})();
