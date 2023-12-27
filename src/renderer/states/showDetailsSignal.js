import { createSignal } from "solid-js";

const [showDetails, setShowDetails] = createSignal(true);
const toggleShowDetails = () => {
  setShowDetails((prev) => !prev);
};

export { showDetails, toggleShowDetails };
