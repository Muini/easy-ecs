import { World } from "../../core/ecs";
import { SaveLocation, SaveSystem } from "../../core/modules/saveSystem";
import { EditorContext } from "./context";

export type EditorAction<N extends string, F> = Record<N, (props: F) => any>;
export const Actions: EditorAction<any, any> = {};

export function registerAction<N extends string, F>(
  name: N,
  fn: (props: F) => any
) {
  Actions[name] = fn;
}

type ActionImportGLTFProps = { path: string };
registerAction("importGLTF", (props: ActionImportGLTFProps) => {});

type ActionImportProject = { name: string; world: EditorContext };
registerAction("importProject", (props: ActionImportProject) => {
  // SaveSystem.restoreWorld();
});

type ActionExportProject = { savename: string; world: EditorContext };
registerAction("exportProject", (props: ActionExportProject) => {
  SaveSystem.saveWorld(props.savename, props.world, SaveLocation.FILE);
});

// registerAction("import");
