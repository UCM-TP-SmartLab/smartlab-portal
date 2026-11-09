import { InjectionToken } from "@angular/core";
export interface PortalConfig {
  demo: boolean;
  timeZone: "Europe/Bratislava";
  siteOrigin: string | null;
}
export const PORTAL_CONFIG = new InjectionToken<PortalConfig>("PORTAL_CONFIG");
