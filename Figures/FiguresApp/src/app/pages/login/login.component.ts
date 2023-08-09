import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { AuthResponse } from "../../models/auth/login.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  invalidLogin: boolean = false;
  error: string = '';
  credentials!: FormGroup;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.credentials = new FormGroup({
      username: new FormControl(null),
      password: new FormControl(null)
    })
  }

  loginOrSignup = (endpoint: string) => {
    if (this.credentials.valid) {
      this.authService.loginOrSignup(endpoint, this.credentials.value).subscribe({
        next: (response: AuthResponse) => {
          const token = response.accessToken;
          const refreshToken = response.refreshToken;
          localStorage.setItem('jwt', token);
          localStorage.setItem('jwtRefresh', refreshToken);
          this.invalidLogin = false;
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          this.invalidLogin = true;
          this.error = err.error;
        }
      });
    }
  }

  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}
