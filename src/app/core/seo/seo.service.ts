import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { PORTAL_CONFIG } from "../../config/portal.config";
export interface FrontendPageMetadata {
  title: string;
  description: string;
  path: string;
  private?: boolean;
}
@Injectable({ providedIn: "root" })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(PORTAL_CONFIG);
  update(data: FrontendPageMetadata): void {
    this.title.setTitle(`${data.title} | SmartLab UCM & Trnava`);
    this.meta.updateTag({ name: "description", content: data.description });
    this.meta.updateTag({
      name: "robots",
      content:
        data.private || this.config.demo ? "noindex,nofollow" : "index,follow",
    });
    this.meta.updateTag({ property: "og:title", content: data.title });
    this.meta.updateTag({
      property: "og:description",
      content: data.description,
    });
    this.document.querySelector('link[rel="canonical"]')?.remove();
    if (this.config.siteOrigin && !data.private) {
      const url = new URL(data.path, this.config.siteOrigin).href;
      const link = this.document.createElement("link");
      link.rel = "canonical";
      link.href = url;
      this.document.head.append(link);
      this.meta.updateTag({ property: "og:url", content: url });
    } else this.meta.removeTag('property="og:url"');
  }
}
