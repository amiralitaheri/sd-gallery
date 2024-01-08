import { createSignal, For } from "solid-js";
import styles from "./TreeView.module.pcss";
import { cn } from "../utils";
import {
  imagesStoreState,
  setSelectedDirectory,
  updateImages,
} from "../states/imagesStore";
import { ChevronRightIcon } from "./icons";

const Node = (props) => {
  const [expanded, setExpanded] = createSignal(false);
  return (
    <li
      class={cn(
        styles.branch,
        expanded() && styles.expanded,
        props.path === imagesStoreState.params.directoryPath && styles.selected,
      )}
    >
      <div
        class={styles.label}
        onClick={() => {
          setExpanded(true);
          setSelectedDirectory(props.path);
          updateImages();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          window.sdGalleryApi.showDirectoryContextMenu({
            id: props.id,
            isRoot: props.isRoot,
            path: props.path,
            name: props.name,
            rootDirectoryId: props.rootDirectoryId,
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
