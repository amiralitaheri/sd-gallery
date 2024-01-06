import { createSignal } from "solid-js";

const [actionLoading, setActionLoading] = createSignal(
  /** @type {{action: "importing" | "syncing" | "removing"}} */ null,
);

export { actionLoading, setActionLoading };
