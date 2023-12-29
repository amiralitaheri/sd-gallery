import styles from "./Header.module.pcss";
import { cn } from "../utils";
import { toggleShowDetails } from "../states/showDetailsSignal";
import { updateFoldersTree } from "../states/foldersStore";
import { AddIcon, LayoutSidebarIcon, RestartIcon } from "./icons";
import { updateImages } from "../states/imagesStore";

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
        <button
          onClick={async () => {
            await window.sdGalleryApi.syncDirectories();
            await updateFoldersTree();
            await updateImages();
          }}
        >
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
