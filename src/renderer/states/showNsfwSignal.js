import { createSignal } from "solid-js";

const localstorageKey = "SHOW_NSFW";

const [showNsfw, setShowNsfw] = createSignal(
  localStorage.getItem(localstorageKey) !== "false",
);
const toggleShowNsfw = () => {
  setShowNsfw((prev) => !prev);
  localStorage.setItem(localstorageKey, showNsfw());
};

export { showNsfw, toggleShowNsfw };
