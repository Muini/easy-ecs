import { newWorld } from "../../core/ecs";

export const Context = newWorld([]);
export const Actions: EditorAction<any, any> = {};

export type EditorAction<N extends string, F> = Record<N, (props: F) => any>;

export function registerAction<N extends string, F>(
  name: N,
  fn: (props: F) => any
) {
  const action = { [name]: fn } as EditorAction<N, F>;
  Object.assign(Actions, action);
}
