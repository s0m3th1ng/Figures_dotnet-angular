import { FigureModel } from "./figure.model";
import { FigureCommentModel } from "./figure-comment.model";

export interface FigureGroupModel {
  id: number,
  pictureId: number,
  figures: FigureModel[],
  comments: FigureCommentModel[]
}
