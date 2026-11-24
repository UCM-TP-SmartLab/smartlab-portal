import { describe, it, expect } from "vitest";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, of } from "rxjs";
import { SpacesApi } from "./spaces-api";
describe("Existujúce PHP trasy priestorov", () => {
  it("zavolá zoznam cez relatívne API a rozpozná testovaciu odpoveď", async () => {
    const paths: string[] = [];
    const http = {
      get: (path: string) => {
        paths.push(path);
        return of({ data: { message: "Zoznam priestorov SmartLab" } });
      },
    } as unknown as HttpClient;
    await expect(
      firstValueFrom(new SpacesApi(http, "/api").list()),
    ).rejects.toMatchObject({ code: "not-implemented" });
    expect(paths).toEqual(["/api/spaces"]);
  });
  it("detail používa existujúcu trasu a nezamieňa ID so skutočnými dátami", async () => {
    const paths: string[] = [];
    const http = {
      get: (path: string) => {
        paths.push(path);
        return of({ data: { id: "1", message: "Detail priestoru SmartLab" } });
      },
    } as unknown as HttpClient;
    await expect(
      firstValueFrom(new SpacesApi(http, "/api").detail("1")),
    ).rejects.toMatchObject({ code: "not-implemented" });
    expect(paths).toEqual(["/api/spaces/1"]);
  });
  it("nepredstiera kontrakt pre neznámu odpoveď", async () => {
    const http = { get: () => of({ data: [] }) } as unknown as HttpClient;
    await expect(
      firstValueFrom(new SpacesApi(http, "/api").list()),
    ).rejects.toMatchObject({ code: "invalid-response" });
  });
});
