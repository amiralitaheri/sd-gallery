import styles from "./Header.module.pcss";
import { cn } from "../utils";
import { toggleShowDetails } from "../states/showDetailsSignal";
import { AddIcon, LayoutSidebarIcon, RestartIcon } from "./icons";
import { importDirectory, syncDirectory } from "../states/actions";
import { actionLoading } from "../states/actionLoadingSignal";

const Header = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <div>
        <button onClick={importDirectory} disabled={!!actionLoading()?.action}>
          <AddIcon /> Import
        </button>
        <button onClick={syncDirectory} disabled={!!actionLoading()?.action}>
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
