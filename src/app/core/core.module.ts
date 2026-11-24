import { NgModule } from "@angular/core";
import { DATA_PROVIDERS } from "../config/provider.config";
import { provideHttpClient, withFetch } from "@angular/common/http";
@NgModule({ providers: [...DATA_PROVIDERS, provideHttpClient(withFetch())] })
export class CoreModule {}
