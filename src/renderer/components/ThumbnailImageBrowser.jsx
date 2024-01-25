import { For, onCleanup, onMount } from "solid-js";
import { imagesStoreState } from "../states/imagesStore";
import styles from "./ThumbnailImageBrowser.module.pcss";
import { cn } from "../utils";
import { selectedImage, setSelectedImage } from "../states/selectedImageSignal";
import { showHidden } from "../states/showHiddenSignal";

let observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src;
      } else {
        entry.target.src = "";
      }
    }
  },
  {
    rootMargin: "300px",
  },
);

const LazyImageLoader = (props) => {
  let ref;
  onMount(() => {
    observer.observe(ref);
  });

  onCleanup(() => {
    observer.unobserve(ref);
  });
  return <img ref={ref} data-src={props.src} />;
};

const ThumbnailImageBrowser = (props) => {
  return (
    <div class={cn(props.class, styles.container)}>
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
              window.sdGalleryApi.showImageContextMenu(
                JSON.parse(JSON.stringify(image)),
              );
            }}
          >
            <LazyImageLoader src={image.path} />
            <span>{image.name}</span>
          </div>
        )}
      </For>
    </div>
  );
};

export default ThumbnailImageBrowser;
