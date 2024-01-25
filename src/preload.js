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
  setImageIsHidden: ({ imageId, isHidden }) =>
    ipcRenderer.invoke("setImageIsHidden", { imageId, isHidden }),
  setDirectoryIsHidden: ({ imageId, isHidden }) =>
    ipcRenderer.invoke("setDirectoryIsHidden", { imageId, isHidden }),
  getDirectories: () => ipcRenderer.invoke("getDirectories"),
  getVaes: () => ipcRenderer.invoke("getVaes"),
  getModels: () => ipcRenderer.invoke("getModels"),
  getModelById: (id) => ipcRenderer.invoke("getModelById", id),
  syncDirectories: (id) => ipcRenderer.invoke("syncDirectories", id),
  deleteDirectory: (id) => ipcRenderer.invoke("deleteDirectory", id),
  showDirectoryContextMenu: (args) =>
    ipcRenderer.send("showDirectoryContextMenu", args),
  onRefresh: (callback) => ipcRenderer.on("refresh", callback),
});
