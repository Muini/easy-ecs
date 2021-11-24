import { Addon } from "../ecs";

export class Config extends Addon {
  static load = (json) => {
    for (let key in json) {
      if (this[key] !== undefined)
        console.warn(
          `Easy-ECS: Config Addon: Key ${key} is already existing in Config and is overwritten`,
          this[key],
          json
        );
      this[key] = json[key];
    }
  };
  static overwrite = (json) => {
    for (let key in json) {
      if (this[key]) {
        this[key] = json[key];
      }
    }
  };
  static serialize = () => {
    let data = {};
    Object.keys(this).forEach((prop) => (data[prop] = this[prop]));
    return JSON.stringify(data);
  };
}
