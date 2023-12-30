import { createStore } from "solid-js/store";

const [state, setState] = createStore({
  models: [],
  modelsMap: {},
});

const updateModels = async () => {
  const models = await window.sdGalleryApi.getModels();
  const modelsMap = models.reduce((map, model) => {
    map[model.id] = model;
    return map;
  }, {});
  setState({ models, modelsMap });
};

updateModels();

const getModelNameById = (id) => {
  return state.modelsMap[id]?.name;
};

export { state as modelsStore, getModelNameById, updateModels };
