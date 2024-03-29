import { For } from "solid-js";
import { imagesStoreState } from "../states/imagesStore";
import styles from "./TableImageBrowser.module.pcss";
import { cn, humanFileSize } from "../utils";
import { selectedImage, setSelectedImage } from "../states/selectedImageSignal";
import { showHidden } from "../states/showHiddenSignal";
import { getModelNameById } from "../states/modelsStore";

const TableImageBrowser = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <div class={cn(styles.item)}>
        <span>Name</span>
        <span>Model</span>
        <span>Created at</span>
        <span>Size</span>
      </div>
      <For
        each={
          showHidden()
            ? imagesStoreState.images
            : imagesStoreState.nonHiddenImages
        }
      >
        {(image) => (
          <div
            class={cn(
              styles.item,
              selectedImage()?.id === image.id && styles.selected,
            )}
            onClick={() => setSelectedImage(image)}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedImage(image);
              window.sdGalleryApi.showImageContextMenu(
                JSON.parse(JSON.stringify(image)),
              );
            }}
          >
            <span>{image.name}</span>
            <span>
              {getModelNameById(image.modelId) || image.modelId || "-"}
            </span>
            <span>{new Date(image.ctimeMs).toLocaleString()}</span>
            <span>{humanFileSize(image.fileSize)}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default TableImageBrowser;
