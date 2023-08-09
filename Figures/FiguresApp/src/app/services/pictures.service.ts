import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { PictureModel } from "../models/picture/picture.model";

@Injectable({providedIn: 'root'})
export class PicturesService {
  constructor(private http: HttpClient) { }

  getUserPictures() {
    return this.http.get<PictureModel[]>(
      `${environment.webApiUrl}/api/pictures`
    );
  }

  getById(id: number) {
    return this.http.get<PictureModel>(
      `${environment.webApiUrl}/api/pictures/getById?id=${id}`
    );
  }

  addPicture(picture: PictureModel) {
    return this.http.post<number>(
      `${environment.webApiUrl}/api/pictures/add`,
      picture,
      {headers: new HttpHeaders({"Content-Type": "application/json"})}
    )
  }

  updatePicture(picture: PictureModel) {
    return this.http.put(
      `${environment.webApiUrl}/api/pictures`,
      picture,
      {headers: new HttpHeaders({"Content-Type": "application/json"})}
    )
  }

  deletePictures(ids: number[]) {
    return this.http.post(
      `${environment.webApiUrl}/api/pictures/delete`,
      ids,
      {headers: new HttpHeaders({"Content-Type": "application/json"})}
    )
  }
}
