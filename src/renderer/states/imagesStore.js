import { createStore } from "solid-js/store";

const [state, setState] = createStore({
  loading: false,
  params: { groupBy: null, filter: null, sort: null, directoryPath: null },
  images: [],
  sfwImages: [],
  selectedImageId: null,
});

const setSelectedDirectory = (directoryPath) => {
  setState("params", "directoryPath", directoryPath);
  updateImages();
};

const updateImages = async () => {
  console.log(state.params);
  setState("loading", true);
  const images = await window.sdGalleryApi.listFiles(
    JSON.parse(JSON.stringify(state.params)),
  );
  console.log(state.params, images);
  setState("images", images);
  setState(
    "sfwImages",
    images.filter((image) => !image.isNsfw),
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
