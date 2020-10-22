import { Addon, Entity } from '../ecs'

export class SaveSystem extends Addon {
  static saveWorld = (world, saveName) => {
    const saveFile = {
      timestamp: Date.now(),
      entities: world.entities.map(entity => entity.serialize())
    }
    localStorage.setItem(`worldsave-${saveName}`, JSON.stringify(saveFile))
    return saveFile
  }
  static restoreWorld = (world, saveName) => {
    const saveFile = localStorage.getItem(`worldsave-${saveName}`)
    const saveData = JSON.parse(saveFile);
    world.entities = []
    saveData.entities.forEach(entityData => {
      new Entity(world).unserialize(entityData)
    })
  }
  static saveData = (name, data) => {
    localStorage.setItem(`data-${name}`, JSON.stringify(data))
  }
  static restoreData = (name) => {
    const savedData = localStorage.getItem(`data-${name}`)
    return savedData ? JSON.parse(savedData) : null
  }
}