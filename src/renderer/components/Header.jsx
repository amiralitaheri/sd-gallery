import styles from "./Header.module.pcss";
import { cn } from "../utils";
import { toggleShowDetails } from "../states/showDetailsSignal";
import { updateFoldersTree } from "../states/foldersStore";
import { AddIcon, LayoutSidebarIcon, RestartIcon } from "./icons";
import { updateImages } from "../states/imagesStore";
import { toast } from "solid-toast";

const importDirectory = () => {
  toast.promise(
    (async () => {
      const result = await window.sdGalleryApi.importDirectory();
      await updateFoldersTree();
      return result;
    })(),
    {
      loading: "Importing new directory.",
      success: (count) => `${count} images imported successfully.`,
      error: "An error occurred 😔",
    },
  );
};

const syncDirectory = () => {
  toast.promise(
    (async () => {
      const result = await window.sdGalleryApi.syncDirectories();
      await updateFoldersTree();
      await updateImages();
      return result;
    })(),
    {
      loading: "Syncing directories.",
      success: ({ added, deleted }) =>
        `${added} images was added.\n ${deleted} images was deleted.`,
      error: "An error occurred 😔",
    },
  );
};

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
