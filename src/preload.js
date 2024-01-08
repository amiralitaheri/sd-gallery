// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sdGalleryApi", {
  importDirectory: () => ipcRenderer.invoke("importDirectory"),
  listFiles: ({ groupBy, filter, sort, directoryPath }) =>
    ipcRenderer.invoke("listFiles", { groupBy, filter, sort, directoryPath }),
  getImageAddons: (imageId) => ipcRenderer.invoke("getImageAddons", imageId),
  getModelsList: () => ipcRenderer.invoke("getImageAddons"),
  setImageRating: ({ imageId, rating }) =>
    ipcRenderer.invoke("setImageRating", { imageId, rating }),
  handleSetImageNsfw: ({ imageId, isNsfw }) =>
    ipcRenderer.invoke("handleSetImageNsfw", { imageId, isNsfw }),
  getDirectories: () => ipcRenderer.invoke("getDirectories"),
  getVaes: () => ipcRenderer.invoke("getVaes"),
  getModels: () => ipcRenderer.invoke("getModels"),
  getModelById: (id) => ipcRenderer.invoke("getModelById", id),
  syncDirectories: (id) => ipcRenderer.invoke("syncDirectories", id),
  deleteDirectory: (id) => ipcRenderer.invoke("deleteDirectory", id),
  onRefresh: (callback) => ipcRenderer.on("refresh", callback),
});
