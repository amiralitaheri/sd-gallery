import { For, onCleanup, onMount } from "solid-js";
import { imagesStoreState } from "../states/imagesStore";
import styles from "./ThumbnailImageBrowser.module.pcss";
import { cn } from "../utils";
import { selectedImage, setSelectedImage } from "../states/selectedImageSignal";
import { showNsfw } from "../states/showNsfwSignal";

let observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      console.log({ entry });
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
        each={showNsfw() ? imagesStoreState.images : imagesStoreState.sfwImages}
      >
        {(image) => (
          <div
            class={cn(
              styles.item,
              selectedImage()?.id === image.id && styles.selected,
            )}
            onClick={() => setSelectedImage(image)}
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
