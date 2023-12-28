import { createSignal } from "solid-js";

const [showNsfw, setShowNsfw] = createSignal(true);
const toggleShowNsfw = () => {
  setShowNsfw((prev) => !prev);
};

export { showNsfw, toggleShowNsfw };
