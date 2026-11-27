import { Injectable } from "@angular/core";
import { FrontendOperationError } from "../data/portal-provider";
import { HttpErrorResponse } from "@angular/common/http";
@Injectable({ providedIn: "root" })
export class PortalErrorService {
  message(error: unknown): string {
    if (error instanceof FrontendOperationError) {
      const messages = {
        unavailable:
          "Táto funkcia zatiaľ nie je dostupná. Vyžaduje pripojenie schváleného backendu.",
        conflict:
          "Vybraný termín je už obsadený. Zvoľte iný čas; vaše údaje zostali zachované.",
        forbidden: "Na túto operáciu nemáte oprávnenie.",
        "invalid-response":
          "Operácia nevrátila platný výsledok. Skúste to znova.",
        invalid: "Skontrolujte zadané údaje a aktuálny stav žiadosti.",
      };
      return messages[error.code];
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0)
        return "Backend nie je dostupný. Overte spustenie PHP servera.";
      if (error.status === 501)
        return "Táto operácia ešte nie je implementovaná na backende.";
      if (error.status === 401) return "Pre túto operáciu sa musíte prihlásiť.";
      if (error.status === 403) return "Na túto operáciu nemáte oprávnenie.";
      if (
        error.status === 409 &&
        error.error?.error?.code === "RESERVATION_CONFLICT"
      )
        return this.message(new FrontendOperationError("conflict"));
      if (error.status === 409)
        return "Stav záznamu sa zmenil. Obnovte prehľad a skúste to znova.";
      if (error.status === 400)
        return "Skontrolujte zadané údaje a skúste to znova.";
      if (error.status === 404)
        return "Požadovaný záznam alebo API trasa sa nenašli.";
      if (error.status >= 500)
        return "Backend nedokázal spracovať požiadavku. Skúste to neskôr.";
    }
    return "Údaje sa nepodarilo spracovať. Skúste to znova.";
  }
}
