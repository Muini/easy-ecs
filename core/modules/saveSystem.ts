import { recoverWorld, World } from "../ecs";

export enum SaveLocation {
  LOCAL,
  FILE,
}
// 💾 SaveSystem addon
export const SaveSystem = (function () {
  return {
    name: "SaveSystem",
    saveWorld: (saveName: string, world: World, location: SaveLocation) => {
      const saveFile = {
        name: saveName,
        timestamp: Date.now(),
        world: world,
      };
      switch (location) {
        case SaveLocation.LOCAL:
          localStorage.setItem(
            `worldsave-${saveName}`,
            JSON.stringify(saveFile)
          );
          break;

        case SaveLocation.FILE:
          const fs = new FileSystem();
          fs.root.filesystem.
          break;

        default:
          break;
      }
      return saveFile;
    },
    restoreWorld: (saveName: string, world: World) => {
      const savedFile = localStorage.getItem(`worldsave-${saveName}`);
      const savedData = JSON.parse(savedFile);
      const savedWorld = savedData.world;
      recoverWorld(world, savedWorld);
    },
    saveData: (name: string, data: any) => {
      localStorage.setItem(
        `data-${name}`,
        typeof data === "string" ? data : JSON.stringify(data)
      );
    },
    restoreData: (name: string): any => {
      const savedData = localStorage.getItem(`data-${name}`);
      return savedData ? JSON.parse(savedData) : null;
    },
  };
})();
