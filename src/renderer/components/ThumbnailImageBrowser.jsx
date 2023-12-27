import { For } from "solid-js";
import { imagesStoreState } from "../states/imagesStore";
import styles from "./ThumbnailImageBrowser.module.pcss";
import { cn } from "../utils";
import { selectedImage, setSelectedImage } from "../states/selectedImageSignal";

const ThumbnailImageBrowser = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
      <For each={imagesStoreState.images}>
        {(image) => (
          <div
            class={cn(
              styles.item,
              selectedImage()?.id === image.id && styles.selected,
            )}
            onClick={() => setSelectedImage(image)}
          >
            <img src={image.path} />
            <span>{image.name}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default ThumbnailImageBrowser;
