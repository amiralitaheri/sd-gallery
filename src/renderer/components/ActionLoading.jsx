import { actionLoading } from "../states/actionLoadingSignal";
import styles from "./ActionLoading.module.pcss";
import { Show } from "solid-js";

const texts = {
  importing: "Importing new directory",
  syncing: "Syncing directories",
  removing: "Removing directory",
};

const ActionLoading = () => {
  return (
    <Show when={actionLoading()}>
      <div class={styles.container}>
        {texts[actionLoading()?.action]}
        <div class={styles.ldsRing}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </Show>
  );
};
export default ActionLoading;
