import {
  FrontendContentEntry,
  FrontendResource,
  UiContentKind,
} from "./frontend.models";
// Schválené záznamy sa pridávajú sem a publikujú novým statickým buildom.
export const PUBLIC_CONTENT: Record<
  UiContentKind,
  readonly FrontendContentEntry[]
> = { news: [], projects: [], events: [], partners: [], opportunities: [] };
export const PUBLIC_RESOURCES: readonly FrontendResource[] = [];
