import { foldersTree } from "../states/foldersStore";
import TreeView from "./TreeView";
import { imagesStoreState, setSelectedDirectory } from "../states/imagesStore";
import styles from "./FoldersTreeView.module.pcss";
import { cn } from "../utils";
import ActionLoading from "./ActionLoading";

const FoldersTreeView = (props) => {
  return (
    <div class={props.class}>
      <button
        class={cn(
          styles.all,
          !imagesStoreState.params.directoryPath && styles.active,
        )}
        onClick={() => setSelectedDirectory(null)}
      >
        All
      </button>
      <TreeView data={foldersTree} />
      <ActionLoading />
    </div>
  );
};

export default FoldersTreeView;
