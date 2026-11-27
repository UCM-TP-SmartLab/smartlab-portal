import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin, map } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import {
  FrontendAvailabilityInterval,
  FrontendResource,
  UiRequestStatus,
} from "../../data/frontend.models";
import { FrontendOperationError } from "./portal-provider";
@Injectable({ providedIn: "root" })
export class SpacesApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly base: string,
  ) {}
  list(): Observable<readonly FrontendResource[]> {
    return forkJoin([this.listKind("spaces"), this.listKind("equipment")]).pipe(
      map(([rooms, equipment]) => [...rooms, ...equipment]),
    );
  }
  private listKind(
    path: "spaces" | "equipment",
  ): Observable<FrontendResource[]> {
    return this.http.get<unknown>(`${this.base}/${path}`).pipe(
      map((response) => {
        const data = this.data(response);
        if (!Array.isArray(data))
          throw new FrontendOperationError("invalid-response");
        return data.map(this.decodeResource);
      }),
    );
  }
  detail(id: string): Observable<FrontendResource> {
    return this.http
      .get<unknown>(this.resourcePath(id))
      .pipe(map((response) => this.decodeResource(this.data(response))));
  }
  availability(
    id: string,
    date: string,
  ): Observable<readonly FrontendAvailabilityInterval[]> {
    return this.http
      .get<unknown>(`${this.resourcePath(id)}/availability`, {
        params: { date },
      })
      .pipe(
        map((response) => {
          const data = this.data(response);
          if (!Array.isArray(data))
            throw new FrontendOperationError("invalid-response");
          return data.map((interval: unknown) => {
            if (
              !interval ||
              typeof interval !== "object" ||
              !("start" in interval) ||
              typeof interval.start !== "string" ||
              !("end" in interval) ||
              typeof interval.end !== "string" ||
              !(Date.parse(interval.start) < Date.parse(interval.end)) ||
              !("status" in interval) ||
              (interval.status !== UiRequestStatus.Pending &&
                interval.status !== UiRequestStatus.Approved)
            ) {
              throw new FrontendOperationError("invalid-response");
            }
            return {
              start: interval.start,
              end: interval.end,
              status: interval.status,
            };
          });
        }),
      );
  }
  private resourcePath(id: string): string {
    const equipment = id.startsWith("equipment-");
    const path = equipment ? "equipment" : "spaces";
    const resourceId = equipment ? id.slice("equipment-".length) : id;
    return `${this.base}/${path}/${encodeURIComponent(resourceId)}`;
  }
  private data(response: unknown): unknown {
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      return response.data;
    }
    throw new FrontendOperationError("invalid-response");
  }

  private decodeResource(data: unknown): FrontendResource {
    if (
      typeof data !== "object" ||
      data === null ||
      !("id" in data) ||
      typeof data.id !== "string" ||
      !("name" in data) ||
      typeof data.name !== "string" ||
      !("description" in data) ||
      typeof data.description !== "string" ||
      !("type" in data)
    ) {
      throw new FrontendOperationError("invalid-response");
    }

    const { id, name, description, type } = data;
    const imageUrl =
      "imageUrl" in data &&
      typeof data.imageUrl === "string" &&
      /^\/api\/resource-images\/[a-f0-9]{32}\.(?:jpg|png|webp)$/.test(
        data.imageUrl,
      )
        ? data.imageUrl
        : undefined;
    if (
      type === "room" &&
      "capacity" in data &&
      typeof data.capacity === "number" &&
      Number.isSafeInteger(data.capacity) &&
      data.capacity > 0
    ) {
      return { id, name, description, type, capacity: data.capacity, imageUrl };
    }
    if (
      type === "equipment" &&
      "quantity" in data &&
      typeof data.quantity === "number" &&
      Number.isSafeInteger(data.quantity) &&
      data.quantity > 0
    ) {
      return {
        id: `equipment-${id}`,
        name,
        description,
        type,
        quantity: data.quantity,
        imageUrl,
      };
    }
    throw new FrontendOperationError("invalid-response");
  }
}
