import { FigureGroupModel } from "./figure-group.model";

export class PictureModel {
  public id?: number;
  public name?: string;
  public figuresCount?: number;
  public changed?: Date;
  public figuresGroups?: FigureGroupModel[];

  constructor(init?: Partial<PictureModel>) {
    if (init) {
      Object.assign(this, init);
      if (init.changed) {
        this.changed = new Date(init.changed);
      }
    }
  }
}
