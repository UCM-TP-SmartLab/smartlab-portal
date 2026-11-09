import { Provider } from "@angular/core";
import { PORTAL_CONFIG } from "./portal.config";
import { PORTAL_PROVIDER } from "../core/data/portal-provider";
import { ProductionPortalProvider } from "../core/data/production-portal.provider";
import siteConfig from "../../../site.config.json";
export const DATA_PROVIDERS: Provider[] = [
  {
    provide: PORTAL_CONFIG,
    useValue: {
      demo: false,
      timeZone: "Europe/Bratislava",
      siteOrigin: siteConfig.origin,
    },
  },
  { provide: PORTAL_PROVIDER, useClass: ProductionPortalProvider },
];
