import { foldersTree } from "../states/foldersStore";
import TreeView from "./TreeView";

const FoldersTreeView = (props) => {
  return (
    <div class={props.class}>
      <TreeView data={foldersTree} />
    </div>
  );
};

export default FoldersTreeView;
