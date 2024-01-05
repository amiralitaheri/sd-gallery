import { createSignal } from "solid-js";

const [actionLoading, setActionLoading] = createSignal(
  /** @type {{action: "importing" | "syncing"}} */ null,
);

export { actionLoading, setActionLoading };
