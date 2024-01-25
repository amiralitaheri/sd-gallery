import { createSignal } from "solid-js";

const localstorageKey = "SHOW_HIDDEN";

const [showHidden, setShowHidden] = createSignal(
  localStorage.getItem(localstorageKey) !== "false",
);
const toggleShowHidden = () => {
  setShowHidden((prev) => !prev);
  localStorage.setItem(localstorageKey, showHidden());
};

export { showHidden, toggleShowHidden };
