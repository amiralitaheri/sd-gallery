import { createStore } from "solid-js/store";

const [state, setState] = createStore([]);

const updateFoldersTree = async () => {
  const directories = await window.sdGalleryApi.getDirectories();
  setState(directories);
};

updateFoldersTree();

export { state as foldersTree, updateFoldersTree };
