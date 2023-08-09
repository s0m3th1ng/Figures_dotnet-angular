import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { GridModule } from '@progress/kendo-angular-grid';
import { EditComponent } from "./edit/edit.component";
import { RouterLink } from "@angular/router";

@NgModule({
  declarations: [
    LoginComponent,
    HomeComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GridModule,
    FormsModule,
    RouterLink
  ],
})
export class PagesModule { }
