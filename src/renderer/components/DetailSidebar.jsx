import { selectedImage } from "../states/selectedImageSignal";
import styles from "./DetailSidebar.module.pcss";

// TODO: Add addons, rating, model name, isNsfw

const DetailSidebar = (props) => {
  return (
    <div class={props.class}>
      <div class={styles.container}>
        <img src={selectedImage() ? selectedImage().path : ""} />
        {selectedImage() ? (
          <div class={styles.details}>
            <div>
              <span>Prompt</span>
              <span>{selectedImage().prompt || "-"}</span>
            </div>
            <div>
              <span>Negative prompt</span>
              <span>{selectedImage().negativePrompt || "-"}</span>
            </div>
            <div>
              <span>Model</span>
              <span>{selectedImage().modelId || "-"}</span>
            </div>
            <div>
              <span>CFG Scale</span>
              <span>{selectedImage().cfgScale || "-"}</span>
            </div>
            <div>
              <span>Seed</span>
              <span>{selectedImage().seed || "-"}</span>
            </div>
            <div>
              <span>Steps</span>
              <span>{selectedImage().steps || "-"}</span>
            </div>
            <div>
              <span>Sampler</span>
              <span>{selectedImage().sampler || "-"}</span>
            </div>
            <div>
              <span>Created at</span>
              <span>
                {new Date(selectedImage().ctimeMs).toLocaleString() || "-"}
              </span>
            </div>
          </div>
        ) : (
          <div class={styles.placeHolderText}>
            Select an image to see it's detail here.
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailSidebar;
