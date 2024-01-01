import { updateFoldersTree } from "./foldersStore";
import { updateImages } from "./imagesStore";
import { toast } from "solid-toast";
import { updateModels } from "./modelsStore";
import { updateVaes } from "./vaesStore";

// Should the toast message handling be in here or where the method is used?

export const importDirectory = () => {
  toast.promise(
    (async () => {
      const result = await window.sdGalleryApi.importDirectory();
      await updateFoldersTree();
      await updateModels();
      await updateVaes();
      return result;
    })(),
    {
      loading: "Importing new directory.",
      success: (count) => `${count} images imported successfully.`,
      error: "An error occurred 😔",
    },
  );
};

export const syncDirectory = () => {
  toast.promise(
    (async () => {
      const result = await window.sdGalleryApi.syncDirectories();
      await updateFoldersTree();
      await updateImages();
      await updateModels();
      await updateVaes();
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
