import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthResponse, LoginModel } from "../models/auth/login.model";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({providedIn: 'root'})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { }

  loginOrSignup(endpoint: string, credentials: LoginModel) {
    return this.http.post<AuthResponse>(
      `${environment.webApiUrl}/api/auth/${endpoint}`,
      {username: credentials.username, password: credentials.password},
      {headers: new HttpHeaders({"Content-Type": "application/json"})}
    )
  }

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('jwtRefresh');
    this.router.navigate(['/login'])
  }

  authenticated() {
    return localStorage.getItem('jwt')?.length;
  }
}
