import { selectedImage, setSelectedImage } from "../states/selectedImageSignal";
import styles from "./DetailSidebar.module.pcss";
import { humanFileSize } from "../utils";
import RateInput from "./RateInput";
import { updateImages } from "../states/imagesStore";
import { getModelNameById } from "../states/modelsStore";
import { createResource, For } from "solid-js";
import { getVaeNameById } from "../states/vaesStore";

// TODO: isHidden switch

const updateRating = async (rating) => {
  const updatedImage = await window.sdGalleryApi.setImageRating({
    imageId: selectedImage().id,
    rating,
  });
  setSelectedImage(updatedImage);
  updateImages();
};

const DetailSidebar = (props) => {
  const [addons] = createResource(selectedImage, async ({ id }) => {
    return await window.sdGalleryApi.getImageAddons(id);
  });
  return (
    <div class={props.class}>
      <div class={styles.container}>
        <img src={selectedImage() ? selectedImage().path : ""} />

        {selectedImage() ? (
          <>
            <RateInput
              rating={selectedImage().rating}
              onChnage={updateRating}
            />
            <div class={styles.resources}>
              <div class={styles.twoColumn}>
                <span>Model</span>
                <span>
                  {getModelNameById(selectedImage().modelId) ||
                    selectedImage().modelId ||
                    "-"}
                </span>
              </div>
              {selectedImage().vaeId && (
                <div class={styles.twoColumn}>
                  <span>VAE</span>
                  <span>{getVaeNameById(selectedImage().vaeId)}</span>
                </div>
              )}
              <For each={addons()}>
                {(addon) => (
                  <div>
                    <span>{addon.type}</span>
                    <span>{addon.name}</span>
                    <span>{addon.value}</span>
                  </div>
                )}
              </For>
            </div>
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
                <span>Seed</span>
                <span>{selectedImage().seed || "-"}</span>
              </div>
              <div class={styles.row}>
                <div>
                  <span>Steps</span>
                  <span>{selectedImage().steps || "-"}</span>
                </div>
                <div>
                  <span>CFG Scale</span>
                  <span>{selectedImage().cfgScale || "-"}</span>
                </div>
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
              <div>
                <span>Size</span>
                <span>{humanFileSize(selectedImage()?.fileSize)}</span>
              </div>
              <div class={styles.row}>
                <div>
                  <span>Width</span>
                  <span>{selectedImage().width || "-"}px</span>
                </div>
                <div>
                  <span>Height</span>
                  <span>{selectedImage().height || "-"}px</span>
                </div>
              </div>
            </div>
          </>
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
