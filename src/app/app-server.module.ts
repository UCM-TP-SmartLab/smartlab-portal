import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { provideServerRendering, RenderMode, withRoutes } from "@angular/ssr";
import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";
import { PUBLIC_CONTENT, PUBLIC_RESOURCES } from "./data/public-content";
import { ServerRoute } from "@angular/ssr";
const detailRoutes: ServerRoute[] = [
  ...(
    [
      ["aktuality", "news"],
      ["projekty", "projects"],
      ["podujatia", "events"],
      ["partneri", "partners"],
      ["prilezitosti-pre-studentov", "opportunities"],
    ] as const
  ).map(([path, kind]) => ({
    path: `${path}/:slug`,
    renderMode: RenderMode.Prerender as const,
    getPrerenderParams: async () =>
      PUBLIC_CONTENT[kind].map((entry) => ({ slug: entry.slug })),
  })),
  {
    path: "priestory-a-vybavenie/:id",
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      PUBLIC_RESOURCES.map((resource) => ({ id: resource.id })),
  },
];
@NgModule({
  imports: [AppModule, ServerModule],
  providers: [
    provideServerRendering(
      withRoutes([
        ...detailRoutes,
        { path: "administracia/prihlasenie", renderMode: RenderMode.Prerender },
        { path: "administracia/**", renderMode: RenderMode.Client },
        { path: "rezervacie/**", renderMode: RenderMode.Client },
        { path: "ziadosti-o-pristup", renderMode: RenderMode.Client },
        { path: "**", renderMode: RenderMode.Prerender },
      ]),
    ),
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
