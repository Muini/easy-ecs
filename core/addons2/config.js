import { Log } from "../utils";

// 📜 Config addon
export const Config = (function () {
  return {
    name: "Config",
    load: (json) => {
      for (let key in json) {
        if (this[key] !== undefined)
          Log(
            "warn",
            `📜 Config addon: Key ${key} is already existing in Config and is overwritten`,
            this[key]
          );
        this[key] = json[key];
      }
    },
    overwrite: (json) => {
      for (let key in json) {
        if (this[key]) {
          this[key] = json[key];
        }
      }
    },
    serialize: () => {
      let data = {};
      Object.keys(this).forEach((prop) => (data[prop] = this[prop]));
      return JSON.stringify(data);
    },
  };
})();
