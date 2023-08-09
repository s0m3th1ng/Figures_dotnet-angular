import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthResponse } from "../models/auth/login.model";
import { AuthService } from "../services/auth.service";

export const authGuard = async () => {
  const jwtHelper = inject(JwtHelperService);
  const router = inject(Router);
  const token = localStorage.getItem('jwt');
  if (token && !jwtHelper.isTokenExpired(token)) {
    return true;
  }

  const isRefreshSuccess = await tryRefreshingTokens(token);
  if (!isRefreshSuccess) {
    router.navigate(['/login']);
  }
  return isRefreshSuccess;
}

async function tryRefreshingTokens(token: string | null): Promise<boolean> {
  const authService = inject(AuthService);
  const refreshToken = localStorage.getItem('jwtRefresh');
  if (!token || !refreshToken) {
    return false;
  }

  const http = inject(HttpClient);
  const credentials = JSON.stringify({accessToken: token, refreshToken: refreshToken});
  const refreshRes = await new Promise<AuthResponse>((resolve, reject) => {
    http.post<AuthResponse>(
      `${environment.webApiUrl}/api/auth/refresh`,
      credentials,
      {
        headers: new HttpHeaders({ "Content-Type": "application/json" })
      }).subscribe({
      next: (res: AuthResponse) => resolve(res),
      error: (_) => {
        reject;
      }
    });
  });
  if (!refreshRes) {
    return false;
  }
  localStorage.setItem('jwt', refreshRes.accessToken);
  localStorage.setItem('jwtRefresh', refreshRes.refreshToken);
  return true;
}
