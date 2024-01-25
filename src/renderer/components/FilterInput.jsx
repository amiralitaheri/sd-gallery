import { For } from "solid-js";
import { modelsStore } from "../states/modelsStore";
import { cn } from "../utils";
import styles from "./FilterInput.module.pcss";
import { updateImages, updateParams } from "../states/imagesStore";

const FilterInput = (props) => {
  let searchRef, modelRef, sortRef, sortDirectionRef;
  const onSubmit = (e) => {
    e.preventDefault();
    const filter = {};
    if (searchRef.value) {
      filter.search = searchRef.value;
    }
    if (modelRef.value) {
      filter.modelId = modelRef.value;
    }

    const sort = {};

    if (sortRef.value) {
      sort.key = sortRef.value;
      sort.direction = sortDirectionRef.value;
    }

    updateParams({ filter, sort });
    updateImages();
  };

  return (
    <div class={cn(props.class, styles.container)}>
      <form onSubmit={onSubmit}>
        <div>
          <input placeholder="Search" ref={searchRef} />
        </div>
        <div class={styles.row}>
          <div class={styles.selectContainer}>
            <label>Model:</label>
            <select ref={modelRef}>
              <option value="">Any</option>
              <For each={modelsStore.models}>
                {(model) => <option value={model.id}>{model.name}</option>}
              </For>
            </select>
          </div>
        </div>
        <div class={styles.row}>
          <div class={styles.selectContainer}>
            <label>Sort:</label>
            <select ref={sortRef}>
              <option value="">Default</option>
              <option value="name">Name</option>
              <option value="ctimeMs">Created at</option>
              <option value="fileSize">File size</option>
              <option value="rating">Rating</option>
              <option value="steps">Steps</option>
              <option value="cfgScale">CFG Scale</option>
            </select>
          </div>
          <div class={styles.selectContainer}>
            <label>Sort Direction:</label>
            <select ref={sortDirectionRef}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <button class={styles.submit} type="submit">
            Filter
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterInput;
