import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { SpacesApi } from "./spaces-api";
import { ProductionPortalProvider } from "./production-portal.provider";
@Injectable()
export class ApiPortalProvider extends ProductionPortalProvider {
  private readonly spaces = inject(SpacesApi);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  override resources() {
    return this.browser ? this.spaces.list() : super.resources();
  }
  override resource(id: string) {
    return this.browser ? this.spaces.detail(id) : super.resource(id);
  }
  // TODO: Ostatné operácie zapojiť po implementácii PHP kostier v backend/app/routes-todo.php.
  // Dovtedy zostáva explicitné unavailable z ProductionPortalProvider, nie falošný úspech.
}
