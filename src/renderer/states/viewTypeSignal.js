import { createSignal } from "solid-js";

const [viewType, setViewType] = createSignal("thumbnail");

export { viewType, setViewType };
