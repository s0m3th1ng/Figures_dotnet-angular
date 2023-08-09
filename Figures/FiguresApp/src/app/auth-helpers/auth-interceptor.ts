import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private http: HttpClient, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const jwt = localStorage.getItem('jwt');
    if (jwt && jwt != "undefined") {
      let bearerReq = this.addTokenHeader(req, jwt);
      return next.handle(bearerReq).pipe(catchError(error => {
        if (error instanceof HttpErrorResponse && !bearerReq.url.includes('auth/login') && error.status === 401) {
          return this.handle401Error(bearerReq, next);
        }
        return throwError(error);
      }));
    }
    return next.handle(req);
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    const token = JSON.stringify({
      accessToken: localStorage.getItem('jwt'),
      refreshToken: localStorage.getItem('jwtRefresh')
    });
    return this.http.post(`${environment.webApiUrl}/auth/refresh`, token).pipe(
      switchMap((token: any) => {
        localStorage.setItem('jwt', token.accessToken);
        localStorage.setItem('jwtRefresh', token.refreshToken);
        return next.handle(this.addTokenHeader(request, token.accessToken));
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
  }
}
