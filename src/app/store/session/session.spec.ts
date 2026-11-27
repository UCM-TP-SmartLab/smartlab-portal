import { describe, expect, it } from "vitest";
import { UiRole } from "../../data/frontend.models";
import { sessionReducer, sessionInitial, sessionLoaded } from "./session.store";

describe("Produkčná relácia", () => {
  it("uloží identitu potvrdenú serverom", () => {
    const session = { id: "42", name: "Test", role: UiRole.Student };
    expect(
      sessionReducer(
        sessionInitial,
        sessionLoaded({ session, csrfToken: "token" }),
      ),
    ).toMatchObject({ ...session, ready: true, csrfToken: "token" });
  });
});
