import { createSignal, For, Show } from "solid-js";
import styles from "./TreeView.module.pcss";
import { cn } from "../utils";
import { imagesStoreState, setSelectedDirectory } from "../states/imagesStore";
import { ChevronRightIcon } from "./icons";
import { showHidden } from "../states/showHiddenSignal";

const Node = (props) => {
  const [expanded, setExpanded] = createSignal(false);
  return (
    <Show when={!props.isHidden || showHidden()}>
      <li
        class={cn(
          styles.branch,
          expanded() && styles.expanded,
          props.path === imagesStoreState.params.directoryPath &&
            styles.selected,
        )}
      >
        <div
          class={styles.label}
          onClick={() => {
            setExpanded(true);
            setSelectedDirectory(props.path);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            window.sdGalleryApi.showDirectoryContextMenu({
              id: props.id,
              isRoot: props.isRoot,
              path: props.path,
              name: props.name,
              rootDirectoryId: props.rootDirectoryId,
              isHidden: props.isHidden,
            });
          }}
        >
          <button
            class={cn(!props.children && styles.hidden)}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
          >
            <ChevronRightIcon />
          </button>

          <span>{props.name}</span>
        </div>
        {props.children && <TreeView data={props.children} />}
      </li>
    </Show>
  );
};

const TreeView = (props) => {
  return (
    <ul class={cn(styles.treeView, props.className)}>
      <For each={props.data}>{(node) => <Node {...node} />}</For>
    </ul>
  );
};

export default TreeView;
