import { updateFoldersTree } from "./foldersStore";
import { updateImages } from "./imagesStore";
import { toast } from "solid-toast";
import { updateModels } from "./modelsStore";
import { updateVaes } from "./vaesStore";
import { setActionLoading } from "./actionLoadingSignal";

// Should the toast message handling be in here or where the method is used?

export const importDirectory = async () => {
  try {
    setActionLoading({ action: "importing" });
    const count = await window.sdGalleryApi.importDirectory();
    await updateFoldersTree();
    await updateModels();
    await updateVaes();
    await updateImages();
    toast.success(`${count} images imported successfully.`);
    setActionLoading();
  } catch (e) {
    toast.error("An error occurred 😔");
  }
};

export const syncDirectory = async () => {
  try {
    setActionLoading({ action: "syncing" });
    const result = await window.sdGalleryApi.syncDirectories();
    await updateFoldersTree();
    await updateImages();
    await updateModels();
    await updateVaes();
    toast.success(
      `${result.added} images was added.\n ${result.deleted} images was deleted.`,
    );
    setActionLoading();
  } catch (e) {
    toast.error("An error occurred 😔");
  }
};
