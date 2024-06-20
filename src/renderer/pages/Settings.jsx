import { createResource, Show } from "solid-js";
import styles from "./Settings.module.pcss";

const Settings = () => {
  const [settings, { mutate }] = createResource(
    window.sdGalleryApi.getSettings,
  );
  return (
    <div class={styles.container}>
      <h1>Settings</h1>
      <Show when={settings()}>
        <div>
          <label>Automatically hide NSFW images upon import</label>
          <input
            onChange={async (event) => {
              await window.sdGalleryApi.setSetting({
                key: "autoHideNsfw",
                value: event.target.checked,
              });
              mutate((prev) => ({
                ...prev,
                autoHideNsfw: event.target.checked,
              }));
            }}
            type="checkbox"
            id="autoHideNsfw"
            checked={settings().autoHideNsfw}
          />
        </div>
        <div>
          <label>Ignore images smaller than X byte</label>
          <input
            value={settings().minFileSize}
            type="number"
            onChange={async (event) => {
              await window.sdGalleryApi.setSetting({
                key: "minFileSize",
                value: event.target.value,
              });
              mutate((prev) => ({
                ...prev,
                minFileSize: event.target.value,
              }));
            }}
          />
        </div>
      </Show>
    </div>
  );
};

export default Settings;
