import { describe, it, expect } from "vitest";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, of } from "rxjs";
import { SpacesApi } from "./spaces-api";
describe("Existujúce PHP trasy priestorov", () => {
  it("spojí zoznam priestorov a vybavenia s rovnakým číselným ID", async () => {
    const paths: string[] = [];
    const http = {
      get: (path: string) => {
        paths.push(path);
        return of({
          data: [
            path.endsWith("/spaces")
              ? {
                  id: "1",
                  name: "Ateliér",
                  description: "Priestor",
                  type: "room",
                  capacity: 10,
                }
              : {
                  id: "1",
                  name: "Fotoaparát",
                  description: "Vybavenie",
                  type: "equipment",
                  quantity: 2,
                },
          ],
        });
      },
    } as unknown as HttpClient;
    const resources = await firstValueFrom(new SpacesApi(http, "/api").list());
    expect(resources.map(({ id }) => id)).toEqual(["1", "equipment-1"]);
    expect(paths).toEqual(["/api/spaces", "/api/equipment"]);
  });
  it("detail vybavenia používa trasu vybavenia", async () => {
    const paths: string[] = [];
    const http = {
      get: (path: string) => {
        paths.push(path);
        return of({
          data: {
            id: "1",
            name: "Fotoaparát",
            description: "Vybavenie",
            type: "equipment",
            quantity: 2,
          },
        });
      },
    } as unknown as HttpClient;
    await expect(
      firstValueFrom(new SpacesApi(http, "/api").detail("equipment-1")),
    ).resolves.toMatchObject({ id: "equipment-1", quantity: 2 });
    expect(paths).toEqual(["/api/equipment/1"]);
  });
  it("akceptuje prázdny katalóg", async () => {
    const http = { get: () => of({ data: [] }) } as unknown as HttpClient;
    await expect(
      firstValueFrom(new SpacesApi(http, "/api").list()),
    ).resolves.toEqual([]);
  });
  it("odmietne neúplný záznam", async () => {
    const http = {
      get: () => of({ data: [{ id: "1" }] }),
    } as unknown as HttpClient;
    await expect(
      firstValueFrom(new SpacesApi(http, "/api").list()),
    ).rejects.toMatchObject({ code: "invalid-response" });
  });
});
