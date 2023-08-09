import { Component, OnInit } from "@angular/core";
import { PicturesService } from "../../services/pictures.service";
import { HttpErrorResponse } from "@angular/common/http";
import { PictureModel } from "../../models/picture/picture.model";
import { Router } from "@angular/router";

const defaultPicture: PictureModel = {
  id: 0,
  name: 'temp',
  figuresCount: 0,
  changed: new Date(),
  figuresGroups: []
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private picturesService: PicturesService, private router: Router) { }

  data: PictureModel[] = [];
  selectedKeys: number[] = [];
  loading: boolean = false;
  error: string = '';

  ngOnInit() {
    this.getPictures();
  }

  getPictures() {
    this.loading = true;
    this.picturesService.getUserPictures().subscribe({
      next: (response) => {
        this.data = response.map(x => new PictureModel(x));
        this.error = '';
      },
      error: (err) => {
        this.error = err.error || 'Internal server error';
      },
    }).add(() => {
      this.loading = false;
    });
  }

  addPicture() {
    this.picturesService.addPicture(defaultPicture).subscribe({
      next: (pictureId: number) => {
        this.editPicture(pictureId);
        this.error = '';
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error || 'Internal server error';
      }
    });
  }

  editPicture(id: number) {
    this.router.navigate(['/edit'], {queryParams: {id: id}});
  }

  deletePicture(id: number) {
    this.deletePictures([id]);
  }

  deletePictures(ids: number[]) {
    this.picturesService.deletePictures(ids).subscribe({
      next: () => {
        this.getPictures();
        this.error = '';
        this.selectedKeys = [];
      },
      error: (err) => {
        this.error = err.error || 'Internal Server Error';
      }
    })
  }
}
