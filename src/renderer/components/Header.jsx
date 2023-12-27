import styles from "./Header.module.pcss";
import { cn } from "../utils";
import { toggleShowDetails } from "../states/showDetailsSignal";
import { updateFoldersTree } from "../states/foldersStore";

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
          import
        </button>
        <button>sync</button>
      </div>
      <div>
        <button onClick={() => toggleShowDetails()}>details</button>
      </div>
    </div>
  );
};

export default Header;
