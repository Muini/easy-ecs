import { newWorld, World } from "../../core/ecs";

export const defaultContext = {};

export type EditorContext = World;
export const ctx: EditorContext = newWorld([]);
