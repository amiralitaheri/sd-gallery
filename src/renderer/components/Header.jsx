import styles from "./Header.module.pcss";
import { cn } from "../utils";
import { toggleShowDetails } from "../states/showDetailsSignal";
import { AddIcon, LayoutSidebarIcon, RestartIcon } from "./icons";
import { importDirectory, syncDirectory } from "../states/actions";

const Header = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <div>
        <button onClick={importDirectory}>
          <AddIcon /> Import
        </button>
        <button onClick={syncDirectory}>
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
