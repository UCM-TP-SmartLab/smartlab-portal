import { Component } from '@angular/core';
import { NAVIGATION } from './config/navigation';
@Component({selector:'app-root',standalone:false,templateUrl:'./app.component.html'})
export class AppComponent { readonly navigation=NAVIGATION; menuOpen=false; closeMenu():void{this.menuOpen=false;} }
