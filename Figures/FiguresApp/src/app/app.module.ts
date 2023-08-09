import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { PagesModule } from "./pages/pages.module";
import { JwtModule } from "@auth0/angular-jwt";
import { environment } from "../environments/environment";
import { authGuard } from "./guards/auth.guard";
import { LoginComponent } from "./pages/login/login.component";
import { HomeComponent } from "./pages/home/home.component";
import { AuthInterceptor } from "./auth-helpers/auth-interceptor";
import { EditComponent } from "./pages/edit/edit.component";

export function tokenGetter() {
  return localStorage.getItem('jwt');
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [environment.webApiUrl],
        disallowedRoutes: []
      }
    }),
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: '', component: HomeComponent, pathMatch: 'full', canActivate: [authGuard] },
      { path: 'edit', component: EditComponent, canActivate: [authGuard] }
    ]),
    PagesModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi:true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
