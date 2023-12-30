import { createSignal } from "solid-js";

const localstorageKey = "SHOW_DETAILS";

const [showDetails, setShowDetails] = createSignal(
  localStorage.getItem(localstorageKey) !== "false",
);
const toggleShowDetails = () => {
  setShowDetails((prev) => !prev);
  localStorage.setItem(localstorageKey, showDetails());
};

export { showDetails, toggleShowDetails };
