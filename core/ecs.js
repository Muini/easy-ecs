import { UUID } from './utils'

export class Addon {
  static get name(){ return this.constructor.name } 
  static onInit = (world) => {}
  static onStart = (world) => {}
  static onBeforeUpdate = (world, time) => {}
  static onAfterUpdate = (world, time) => {}
}
export class World {
  addons = [];
  systems = [];
  systemsList = [];
  entities = [];
  constructor(props = {addons: [], systems: []}){
    this.addons = props.addons
    props.systems.forEach(system => {
      this.systems = [...this.systems, new system()]
    })
    this.init()
  }
  addEntity(entity){
    this.entities.push(entity)
  }
  start(){
    this.addons.forEach(addon => addon.onStart(this))
  }
  init(){
    // const now = performance.now()
    this.addons.forEach(addon => addon.onInit(this))
    this.systems.forEach(system => {
      const entities = this.entities.filter(
        entity => system.dependencies.every(
          dependency => entity.components.indexOf(dependency.name) >= 0
        )
      )
      system.onInit(entities)
    })
    // console.log('init took', performance.now() - now, 'ms\n')
  }
  update(time){
    // const now = performance.now()
    this.addons.forEach(addon => addon.onBeforeUpdate(this, time))
    this.systems.forEach(system => {
      const entities = this.entities.filter(
        entity => system.dependencies.every(
          dependency => entity.components.indexOf(dependency.name) >= 0
        )
      )
      system.onUpdate(entities)
    })
    this.addons.forEach(addon => addon.onAfterUpdate(this, time))
    // console.log('update took', performance.now() - now, 'ms\n')
  }
}
export class Entity {
  id = UUID();
  components = []
  static components = []
  constructor(world, values) {
    this.constructor.components.forEach(component => {
      this.addComponent(component, values);
    })
    world.addEntity(this);
  }
  addComponent(component, values){
    this.components.push(component.name)
    component.props.forEach(prop => {
      this[prop] = values[prop] ? values[prop] : component[prop]
    })
  }
  serialize(){
    return JSON.stringify(this)
  }
  unserialize(json){
    const props = JSON.parse(json)
    Object.keys(props).forEach(prop => {
      this[prop] = props[prop] 
    })
  }
  destroy(){}
}
export class Component {
  static get props(){
    return Object.keys(this)
  }
  static get name(){
    return this.constructor.name
  }
}
export class System {
  get name(){ return this.constructor.name }
  dependencies = [];
  onInit = (entities) => {};
  onUpdate = (entities) => {};
}
