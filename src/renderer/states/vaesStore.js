import { createStore } from "solid-js/store";

const [state, setState] = createStore({
  vaes: [],
  vaesMap: {},
});

const updateVaes = async () => {
  const vaes = await window.sdGalleryApi.getVaes();
  const vaesMap = vaes.reduce((map, vae) => {
    map[vae.id] = vae;
    return map;
  }, {});
  setState({ vaes, vaesMap });
};

updateVaes();

const getVaeNameById = (id) => {
  return state.vaesMap[id]?.name;
};

export { state as vaesStore, getVaeNameById, updateVaes };
