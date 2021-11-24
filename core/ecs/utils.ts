// https://github.com/ai/nanoid
export let nanoid = (t = 21): string => {
  let e = "",
    r = crypto.getRandomValues(new Uint8Array(t));
  for (; t--; ) {
    let n = 63 & r[t];
    e +=
      n < 36
        ? n.toString(36)
        : n < 62
        ? (n - 26).toString(36).toUpperCase()
        : n < 63
        ? "_"
        : "-";
  }
  return e;
};

export function deepclone<T>(o: T): T {
  let out, v, key;
  out = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    out[key] = typeof v === "object" && v !== null ? deepclone(v) : v;
  }
  return out;
}

export type LogType = "success" | "info" | "warn" | "error";
export type Log = {
  type: LogType;
  class: any;
  message: string;
};
export function Log(type: LogType, message: string, caller: any) {
  const log: Log = {
    type: type,
    class: caller?.name ?? "ECS",
    message: message,
  };
  function getColor(type: LogType) {
    let color = undefined;
    switch (type) {
      case "success":
        color = "LimeGreen";
        break;
      case "info":
        color = "DodgerBlue";
        break;
      case "warn":
        color = "Orange";
        break;
      case "error":
      default:
        color = "OrangeRed";
        break;
    }
    return color;
  }
  const logMessage = `%c${log.class}%c ${log.message}`;
  const styles =
    "color:white;background:" + getColor(log.type) + ";padding:2px 4px;";
  // Write it in the console
  if (log.type === "error")
    console.error(logMessage, styles, "color:black", caller);
  else if (log.type === "warn")
    console.warn(logMessage, styles, "color:black", caller);
  else console.info(logMessage, styles, "color:black");
}
