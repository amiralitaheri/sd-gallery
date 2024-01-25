import { createStore } from "solid-js/store";

const [state, setState] = createStore({
  loading: false,
  params: { groupBy: null, filter: null, sort: null, directoryPath: null },
  images: [],
  nonHiddenImages: [],
  selectedImageId: null,
});

const setSelectedDirectory = (directoryPath) => {
  setState("params", "directoryPath", directoryPath);
  updateImages();
};

const updateImages = async () => {
  setState("loading", true);
  const images = await window.sdGalleryApi.listFiles(
    JSON.parse(JSON.stringify(state.params)),
  );
  setState("images", images);
  setState(
    "nonHiddenImages",
    images.filter((image) => !image.isHidden),
  );
  setState("loading", false);
};

updateImages();

const updateParams = (params) => {
  setState("params", (prevState) => ({ ...prevState, ...params }));
};

export {
  state as imagesStoreState,
  setSelectedDirectory,
  updateImages,
  updateParams,
};
