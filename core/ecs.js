import { UUID } from './utils'

export class Addon {
  constructor(){
    throw Error('Easy-ECS: Cannot instantiate class Addon');
  }
  static onInit = (world) => {}
  static onBeforeUpdate = (world, time) => {}
  static onAfterUpdate = (world, time) => {}
}
export class World {
  addons = [];
  systems = [];
  entities = [];
  constructor(props = {addons: [], systems: []}){
    this.addons = props.addons
    props.systems.forEach(system => {
      this.systems = [...this.systems, new system()]
    })
  }
  addEntity(entity){
    this.entities.push(entity)
  }
  removeEntity(entity){
    if(this.entities.indexOf(entity) === -1) return console.warn('Easy-ECS: Cannot remove entity from world', entity)
    this.entities.splice( this.entities.indexOf(entity), 1 )
  }
  getEntitiesWithComponents(componentsArray){
    return componentsArray.length ? this.entities.filter(
      entity => componentsArray.every(
        component => entity.components.indexOf(component.name) >= 0
      )
    ) : this.entities
  }
  getEntitiesOfType(entityConstructor){}
  start(){
    // const now = performance.now()
    this.addons.forEach(addon => addon.onInit(this))
    this.systems.forEach(system => {
      const entities = this.getEntitiesWithComponents(system.dependencies)
      system.onInit(this, entities)
    })
    // console.log('init took', performance.now() - now, 'ms\n')
  }
  update(time){
    // const now = performance.now()
    this.addons.forEach(addon => addon.onBeforeUpdate(this, time))
    this.systems.forEach(system => {
      const entities = this.getEntitiesWithComponents(system.dependencies)
      system.onUpdate(this, entities)
    })
    this.addons.forEach(addon => addon.onAfterUpdate(this, time))
    // console.log('update took', performance.now() - now, 'ms\n')
  }
}
export class Entity {
  id = UUID();
  components = []
  world = null
  static components = []
  constructor(world, values) {
    this.constructor.components.forEach(component => {
      this.addComponent(component, values);
    })
    this.world = world;
    world.addEntity(this);
  }
  addComponent(component, values = {}){
    component.props.forEach(prop => {
      if(this[prop] && prop !== 'name') console.warn(`Easy-ECS: Entity prop ${prop} overwrite by component ${component.name}`, this)
      this[prop] = values[prop] ? values[prop] : component[prop]
    })
    this.components.push(component.name)
  }
  removeComponent(component, shouldClean = false){  
    if(this.components.indexOf(component.name) === -1) return;
    this.components.splice(this.components.indexOf(component.name), 1)
    if(!component.props || !shouldClean) return;
    component.props.forEach(prop => {
      delete this[prop]
    })
  }
  serialize(){
    let data = {}
    Object.keys(this).forEach(prop => (prop !== 'world' && prop !== 'name') ? data[prop] = this[prop] : false)
    return JSON.stringify(data)
  }
  unserialize(json){
    const props = JSON.parse(json)
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop] 
    })
  }
  destroy(){
    this.world.removeEntity(this)
  }
}
export class Component {
  static name = 'Unnamed Component'
  constructor(){
    throw Error('Easy-ECS: Cannot instantiate class Component');
  }
  static get props(){
    let returnProps = []
    for(let prop in this){
      returnProps.push(prop)
    }
    return returnProps
  }
}
export class System {
  dependencies = [];
  onInit = (entities) => {};
  onUpdate = (entities) => {};
}
