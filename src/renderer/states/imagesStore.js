import { createStore } from "solid-js/store";

const [state, setState] = createStore({
  loading: false,
  params: { groupBy: null, filter: null, sort: null, directoryPath: null },
  images: [],
  selectedImageId: null,
});

const setSelectedDirectory = (directoryPath) => {
  setState("params", "directoryPath", directoryPath);
};

const updateImages = async () => {
  setState("loading", true);
  const images = await window.sdGalleryApi.listFiles({ ...state.params });
  console.log(state.params, images);
  setState("images", images);
  setState("loading", false);
};

updateImages();

export { state as imagesStoreState, setSelectedDirectory, updateImages };
