import type { ProposalJson } from "@/types/proposal";

export const proposalStorageKey = "websiteProposalJson";
export const proposalStorageEvent = "proposal-storage-updated";
export const currentDemoPreviewStorageKey = "syncCraftCurrentDemoPreview";

export type CurrentDemoPreview = {
  title: string;
  html: string;
  selectedFileName?: string;
  pages?: Array<{ name: string; fileName: string; html: string }>;
};

export function saveProposal(proposal: ProposalJson) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(proposalStorageKey, JSON.stringify(proposal));
    window.dispatchEvent(new Event(proposalStorageEvent));
  } catch {
    // Some browser privacy modes can block localStorage. The result page still works with URL data.
  }
}

export function loadProposalText() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(proposalStorageKey);
  } catch {
    return null;
  }
}

export function loadProposal() {
  const value = loadProposalText();

  if (!value) return null;

  return parseProposal(value);
}

export function parseProposal(value: string) {
  try {
    return JSON.parse(value) as ProposalJson;
  } catch {
    return null;
  }
}

export function subscribeProposal(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === proposalStorageKey) callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(proposalStorageEvent, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(proposalStorageEvent, callback);
  };
}

export function saveCurrentDemoPreview(preview: CurrentDemoPreview) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(currentDemoPreviewStorageKey, JSON.stringify(preview));
  } catch {
    // Preview can still be shown inside the current page if localStorage is unavailable.
  }
}

export function clearCurrentDemoPreview() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(currentDemoPreviewStorageKey);
  } catch {
    // Ignore storage errors.
  }
}

export function loadCurrentDemoPreviewText() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(currentDemoPreviewStorageKey);
  } catch {
    return null;
  }
}

export function parseCurrentDemoPreview(value: string | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<CurrentDemoPreview>;

    if (!parsed.html) return null;

    return {
      title: parsed.title ?? "SyncCraft Demo",
      html: parsed.html,
      selectedFileName: typeof parsed.selectedFileName === "string" ? parsed.selectedFileName : undefined,
      pages: Array.isArray(parsed.pages) ? parsed.pages : undefined,
    } satisfies CurrentDemoPreview;
  } catch {
    return null;
  }
}

export function loadCurrentDemoPreview() {
  return parseCurrentDemoPreview(loadCurrentDemoPreviewText());
}
