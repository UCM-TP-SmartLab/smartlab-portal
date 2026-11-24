import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { API_BASE_URL } from "../../config/api.config";
import { FrontendResource } from "../../data/frontend.models";
import { FrontendOperationError } from "./portal-provider";
@Injectable({ providedIn: "root" })
export class SpacesApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly base: string,
  ) {}
  list(): Observable<readonly FrontendResource[]> {
    return this.http
      .get<unknown>(`${this.base}/spaces`)
      .pipe(map((response) => this.decode(response)));
  }
  detail(id: string): Observable<FrontendResource> {
    return this.http
      .get<unknown>(`${this.base}/spaces/${encodeURIComponent(id)}`)
      .pipe(map((response) => this.decode(response)));
  }
  private decode(_response: unknown): never {
    // TODO: Backend teraz vracia iba { data: { message, id? } }. Po dodaní reálnych dát pridať typovaný adaptér zoznamu/detailu.
    if (
      typeof _response === "object" &&
      _response !== null &&
      "data" in _response
    ) {
      const data = _response.data;
      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      )
        throw new FrontendOperationError("not-implemented");
    }
    throw new FrontendOperationError("invalid-response");
  }
}
