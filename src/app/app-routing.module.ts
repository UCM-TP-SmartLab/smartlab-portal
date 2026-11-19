import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "domov" },
  {
    path: "aktuality",
    loadChildren: () =>
      import("./modules/news/news.module").then((m) => m.NewsModule),
  },
  {
    path: "projekty",
    loadChildren: () =>
      import("./modules/projects/projects.module").then(
        (m) => m.ProjectsModule,
      ),
  },
  {
    path: "podujatia",
    loadChildren: () =>
      import("./modules/events/events.module").then((m) => m.EventsModule),
  },
  {
    path: "partneri",
    loadChildren: () =>
      import("./modules/partners/partners.module").then(
        (m) => m.PartnersModule,
      ),
  },
  {
    path: "prilezitosti-pre-studentov",
    loadChildren: () =>
      import(
        "./modules/student-opportunities/student-opportunities.module"
      ).then((m) => m.StudentOpportunitiesModule),
  },
  {
    path: "prihlasenie",
    loadChildren: () =>
      import("./modules/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "administracia/prihlasenie",
    data: { management: true },
    loadChildren: () =>
      import("./modules/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "",
    loadChildren: () =>
      import("./modules/catalog/catalog.module").then((m) => m.CatalogModule),
  },
  {
    path: "",
    loadChildren: () =>
      import("./modules/workspace/workspace.module").then(
        (m) => m.WorkspaceModule,
      ),
  },
  {
    path: "",
    loadChildren: () =>
      import("./modules/public/public.module").then((m) => m.PublicModule),
  },
  { path: "**", redirectTo: "404" },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: "enabledBlocking",
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
