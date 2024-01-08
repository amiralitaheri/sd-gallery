import { createSignal } from "solid-js";

const [actionLoading, setActionLoading] = createSignal(
  /** @type {{action: "importing" | "syncing" | "removing" | "refreshing"}} */ null,
);

export { actionLoading, setActionLoading };
