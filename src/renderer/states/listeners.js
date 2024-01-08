import { refresh } from "./actions";

export const registerListeners = () => {
  window.sdGalleryApi.onRefresh(refresh);
};
