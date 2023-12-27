import styles from "./Header.module.pcss";
import { cn } from "../utils";
import { toggleShowDetails } from "../states/showDetailsSignal";
import { updateFoldersTree } from "../states/foldersStore";
import { AddIcon, LayoutSidebarIcon, RestartIcon } from "./icons";

const Header = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <div>
        <button
          onClick={async () => {
            await window.sdGalleryApi.importDirectory();
            await updateFoldersTree();
          }}
        >
          <AddIcon /> Import
        </button>
        <button>
          <RestartIcon />
          Sync
        </button>
      </div>
      <div>
        <button onClick={() => toggleShowDetails()}>
          <LayoutSidebarIcon />
          Details
        </button>
      </div>
    </div>
  );
};

export default Header;
