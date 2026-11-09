import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
@NgModule({imports:[RouterModule.forRoot([
{path:'',pathMatch:'full',redirectTo:'domov'},
{path:'',loadChildren:()=>import('./modules/public/public.module').then(m=>m.PublicModule)},
{path:'**',redirectTo:'404'}
],{initialNavigation:'enabledBlocking',scrollPositionRestoration:'enabled'})],exports:[RouterModule]})
export class AppRoutingModule {}
