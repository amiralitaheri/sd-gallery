// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sdGalleryApi", {
  importDirectory: () => ipcRenderer.invoke("importDirectory"),
  listFiles: ({ groupBy, filter, sort, directoryId }) =>
    ipcRenderer.invoke("listFiles", { groupBy, filter, sort, directoryId }),
  getImageAddons: (imageId) => ipcRenderer.invoke("getImageAddons", imageId),
  getModelsList: () => ipcRenderer.invoke("getImageAddons"),
  setImageRating: ({ imageId, rating }) =>
    ipcRenderer.invoke("setImageRating", { imageId, rating }),
  handleSetImageNsfw: ({ imageId, isNsfw }) =>
    ipcRenderer.invoke("handleSetImageNsfw", { imageId, isNsfw }),
  getDirectories: () => ipcRenderer.invoke("getDirectories"),
});
