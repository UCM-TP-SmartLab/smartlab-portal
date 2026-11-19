import { Provider } from "@angular/core";
import { PORTAL_CONFIG } from "./portal.config";
import { PORTAL_PROVIDER } from "../core/data/portal-provider";
import { DemoPortalProvider } from "../core/data/demo-portal.provider";
export const DATA_PROVIDERS: Provider[] = [
  {
    provide: PORTAL_CONFIG,
    useValue: { demo: true, timeZone: "Europe/Bratislava", siteOrigin: null },
  },
  { provide: PORTAL_PROVIDER, useClass: DemoPortalProvider },
];
