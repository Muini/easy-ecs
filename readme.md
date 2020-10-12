
<p align="center">
  <img src="https://raw.githubusercontent.com/Muini/easy-ecs/master/easy-ecs.svg" alt="Easy ECS Logo" width="240" />
</p>

<h1 align="center">⚙ Easy ECS</h1>

<p align="center">
    <a href="https://www.npmjs.com/package/@muini/easy-ecs">
        <img src="https://img.shields.io/npm/v/@muini/easy-ecs?style=flat-square" alt="license" />
    </a>
    <a href="https://bundlephobia.com/result?p=@muini/easy-ecs">
        <img src="https://img.shields.io/bundlephobia/min/@muini/easy-ecs?style=flat-square" alt="size" />
    </a>
</p>

Easy Entity Component System is a minimalist open-source Javascript ES7 library that helps you create games quickly. It's focused on developer happyness and performance. It has zero dependancies, is super lightweight and extensible.

## Introduction

### Prerequisites

Just get a simple javascript project with `npm` support.
You can also use the build version and use it without any stack.

⚠️ Note: Very early developement, expect breaking changes.

#### Glossary

- **World**: One class instance to rule them all.
- **Entity**: It's a instantiable class that is composed of **Components**.
- **Component**: The «data» of your entity. Never instantiated, only declarative.
- **System**: Where the logic happens. A system process **Entities** that have a specific set of **Components**.
- **Addon**: This is a way to extend the **World**.

## Getting Started

### Installing

Install package from `npm` in your project or get the `build/easy-ecs.js` file.

```javascript
npm i @muini/easy-ecs
```

### Usage

Creating the structure of your game is a declarative process

#### Component
```javascript
import { Component } from 'easy-ecs';
// Component
export class Position extends Component{
  static x = 0;
  static y = 0;
}
// Component inheritence
export class Position3D extends Position{
  static z = 0;
}
// Another component
export class Health extends Component{
  static health = 0;
  static maxHealth = 0;
}
```
#### Entity
```javascript
import { Entity } from 'easy-ecs';
// Entity is just a list of Component classes
export class Character extends Entity {
  static components = [Position]
}
// Entity inheritence, you need to spread the parent components array
export class Hero extends Character {
  static components = [...super.components, Health]
}
```
#### System
```javascript
import { System } from 'easy-ecs';
// System declaration
export class CharacterMovement extends System {
  // Component list that will filter entities that have those components
  dependencies = [Position]; 
  // onUpdate Will fire every world.update (or every frame if Loop Addon is added)
  onUpdate = (entities) => { 
    // entities is filtered entities
    entities.forEach(entity => {
      entity.x += 0.1 * Time.delta; //Time is an Addon, see below
    })
  };
}
// Make your own system
export class MySystem extends System {
  dependencies = [MyComponent, ...]; 
  onInit = (entities) => {};
  onUpdate = (entities) => {};
}
```

#### World & Game start example
```javascript

import { World } from 'easy-ecs';
import { Loop, Time, Input, Renderer, SaveSystem } from 'easy-ecs/addons';

import { Character } from './your-game/entities';
import { PlayerMovement, CharacterMovement, CharacterRenderer } from './your-game/systems';

//Instantiate your world
const world = new World({
  // Add as much addon as you can to extend the world and engine
  addons: [Loop, Time, Input, Renderer, SaveSystem, ...],
  // Order of systems is the order of execution
  systems: [PlayerMovement, CharacterMovement, CharacterRenderer, ...]
});
// Instantiate an entity, first arg is a World, second is default values
const bob = new Character(world, {
  x: 10,
  y: 10,
  health: 100,
  maxHealth: 100
})

// Start the world, that's all !
world.start()

// You can manually update it with (useless if Loop Addon is used) :
world.update(Date.now())

```

### Addon

Addon is an easy way to extend the world engine.
Addon will never be instantiated and all properties must be static.

#### Official Addons

- 🔁 **Loop**: 
  Will set a loop calling `world.update(timestamp)` based on `requestAnimationFrame`
- ⏱️ **Time**: 
  Access `Time.time`, `Time.delta` and `Time.elapsed` easily anywhere
- 🕹️ **Input**: 
  Access to current input, either `Input.mouse` position or `Input.isPressed(key)` to check if a specific key is pressed, or `Input.keypress` to get all keys pressed
- 🖼️ **Renderer**: 
  Canvas Renderer with basic access to `Renderer.canvas` and context `Renderer.ctx`
- 💾 **SaveSystem**: 
  Save & restore world state from `localStorage` using `const id = SaveSystem.saveGame(world, saveName)` and `SaveSystem.restoreGame(world, saveName)`

#### Custom Addon

```javascript
// Example of a new addon
export class MyAddon extends Addon {
  static onInit = (world) => { /*Do stuff*/ }
  static onBeforeUpdate = (world, time) => { /*Do stuff*/ }
  static onAfterUpdate = (world, time) => { /*Do stuff*/ }
}
// Example of Time Addon
export class Time extends Addon {
  static time = 0;
  static delta = 0;
  static elapsed = 0;
  static onBeforeUpdate = (world, time) => {
    Time.delta = time - Time.time;
    Time.time = time;
    Time.elapsed += Time.delta;
  }
}
```

## Roadmap

- [x] Core
- [x] Addons: Loop, Time, Input, Renderer(canvas), SaveSystem
- [x] Readme
- [ ] Example
- [ ] Documentation
- [ ] Addon: AssetManager
- [ ] Addon: Audio

Other Addon ideas = UI (html based?), WebGL Renderer, ...

## Inspired by

* [Unity](https://unity.com/) - ECS approach from Unity game engine
* [ECSY](https://ecsy.io/) - ECS approach from Mozilla team
* [MattDesl](https://twitter.com/mattdesl/status/1283089334791536641) - ECS approach from MattDesl

## Contributing

Feel free to open issues for questions, bugs or improvements & PR !

## Authors

* **Corentin Flach** - *Initial work* - [Github](https://github.com/CorentinFlach)

<!-- See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project. -->

## License

This project is licensed under the MIT License

