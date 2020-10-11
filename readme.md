
# ⚙ Easy ECS

Easy Entity Component System is a minimalist open-source Javascript ES7 library that helps you create games quickly. It's focused on developer happyness and performance. It has zero dependancies, is super lightweight and extensible.

## Getting Started

### Prerequisites

Just get a simple javascript project with npm support and Parcel builder (to support ES7) for exemple

### Installing

A step by step series of examples that tell you how to get a development env running

Install package from `npm` in your project

```javascript
yarn add easy-ecs
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
export class 3DPosition extends Position{
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
  dependencies = [Position]; // Component list that will filter entities that have those components
  // onUpdate Will fire every world.update (or every frame if Loop Addon is added)
  // entities is filtered entities
  onInit = (entities) => {}
  onUpdate = (entities) => { 
    entities.forEach(entity => {
      entity.x += 0.1 * Time.delta; //Time is an Addon, see below
    })
  };
}
```

#### World & Game start
```javascript

import { World } from 'easy-ecs';
import { Loop, Time, Input, Renderer, SaveGame } from 'easy-ecs/addons';

import { Character } from '.your-game/entities';
import { PlayerMovement, CharacterMovement, CharacterRenderer } from '.your-game/systems';

//Instantiate your world
const world = new World({
  // Add as much addon as you can to extend the world and engine
  addons: [Loop, Time, Input, Renderer, SaveGame, ...],
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

// If Addon Loop is included, the game will run in a loop, otherwise you can manually update it
world.update()

```

#### Addon

Addon is an easy way to extend the world engine.
Addon will never be instantiated and all properties must be static.

##### Official Addon

- 🔁 **Loop**: Will set a loop calling `world.update()` based on `requestAnimationFrame`
- ⏱️ **Time**: Access `Time.time`, `Time.delta` and `Time.elapsed` easily anywhere
- 🕹️ **Input**: Access to current input, either `Input.mouse` position or `Input.isPressed(keycode)` to check if a specific key is pressed, or `Input.keypress` to get all keys pressed
- 🖼️ **Renderer**: Canvas Renderer with basic access to `Renderer.canvas` and context `Renderer.ctx`
- 💾 **SaveGame**: Save & restore world state from `localStorage` using `const id = SaveGame.save()` and `SaveGame.restore(id)`

##### Custom Addon

```javascript
// Exemple of a new addon
export class MyAddon extends Addon {
  static onInit = (world) => { /*Do stuff*/ }
  static onStart = (world) => { /*Do stuff*/ }
  static onBeforeUpdate = (world, time) => { /*Do stuff*/ }
  static onAfterUpdate = (world, time) => { /*Do stuff*/ }
}
// Exemple of Time Addon
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
- [x] Addons: Loop, Time, Input, Renderer(canvas), SaveGame
- [x] Readme
- [ ] Exemple
- [ ] Documentation
- [ ] Addon: Audio
- [ ] Addon: WebGL Renderer

## Inspired by

* [Unity](https://unity.com/) - ECS approach from Unity game engine
* [ECSY](https://ecsy.io/) - ECS approach from Mozilla team
* [MattDesl](https://twitter.com/mattdesl/status/1283089334791536641) - ECS approach from MattDesl

## Contributing

Feel free to open issues & PR !

## Authors

* **Corentin Flach** - *Initial work* - [Github](https://github.com/CorentinFlach)

<!-- See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project. -->

## License

This project is licensed under the MIT License

