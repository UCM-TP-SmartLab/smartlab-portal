import { Injectable } from "@angular/core";
import { FrontendOperationError } from "../data/portal-provider";
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
    return "Údaje sa nepodarilo spracovať. Skúste to znova.";
  }
}
