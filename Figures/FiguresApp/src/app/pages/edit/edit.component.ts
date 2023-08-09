import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { PictureModel } from "../../models/picture/picture.model";
import { ActivatedRoute, Router } from "@angular/router";
import { PicturesService } from "../../services/pictures.service";
import Konva from "konva";
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { FigureCommentModel } from "../../models/picture/figure-comment.model";

function defaultFigureConfig(): any {
  return {
    x: 50,
    y: 50,
    width: 70,
    height: 70,
    fill: randomColor(),
    stroke: randomColor()
  };
}
function randomColor() {
  return `#${Math.round(0xffffff * Math.random()).toString(16).padStart(6, '0')}`
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements AfterViewInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private picturesService: PicturesService) {
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl('', [Validators.required]),
      figuresGroups: new FormArray([])
    });
  }

  picture!: PictureModel;
  error: string = '';
  @ViewChild('picture') pictureContainer!: ElementRef;
  @ViewChild('pictureMenu') pictureMenu!: ElementRef;
  form!: FormGroup;
  layer!: Konva.Layer;
  grouping: boolean = false;
  unionising: boolean = false;
  selectedFigure?: Konva.Rect;
  comment: string = '';

  ngAfterViewInit() {
    this.route.queryParams.subscribe({
      next: (value) => {
        if (!value || !value.id) {
          this.error = 'Picture id not found';
          return;
        }
        this.getPicture(value.id);
      },
      error: (err) => {
        this.error = err.error || 'Internal server error';
      }
    });
  }

  getPicture(id: number) {
    this.picturesService.getById(id).subscribe({
      next: (picture) => {
        this.form.patchValue({
          id: picture.id,
          name: picture.name
        });
        this.picture = picture;
        this.setupPicture();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error || 'Internal server error';
      }
    });
  }

  setupPicture() {
    var stage = new Konva.Stage({
      container: 'picture',
      width: this.pictureContainer.nativeElement.offsetWidth,
      height: this.pictureContainer.nativeElement.offsetHeight,
    });
    stage.on('click', (e) => {
      if (e.target === stage) {
        this.grouping = false;
        this.unionising = false;
        this.comment = '';
        this.hideMenu();
      }
    })
    this.layer = new Konva.Layer();
    var groups = [];
    this.picture.figuresGroups?.forEach(figuresGroup => {
      var group = new Konva.Group({ draggable: true });
      var comments: Konva.Label[] = [];
      groups.push(group);
      figuresGroup.figures.forEach(figure => {
        var setup = defaultFigureConfig();
        setup.x = figure.x;
        setup.y = figure.y;
        var fig = new Konva.Rect(setup);
        fig.on('click', () => { this.onFigureClick(fig) });
        group.add(fig);
        figuresGroup.comments.filter(x => x.figureId == figure.id).forEach(x => {
          comments.push(this.setupComment(fig, x));
        });
      });
      this.layer.add(group);
      this.redrawBorder(group as unknown as Konva.Container);
      this.commentGroup(group, comments);
    });
    stage.add(this.layer);
  }

  setupComment(figure: Konva.Rect, comment: FigureCommentModel) {
    var label = new Konva.Label({
      opacity: 0.75,
      name: figure._id.toString()
    });
    label.on('click', (e) => { this.deleteComment(<Konva.Shape>e.target) });
    label.add(
      new Konva.Tag({
        stroke: figure?.fill(),
        fill: '#ccc'
      })
    );
    label.add(
      new Konva.Text({
        text: comment.value,
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'black',
      })
    );
    return label;
  }

  addFigure() {
    var figure = new Konva.Rect(defaultFigureConfig());
    figure.on('click', () => { this.onFigureClick(figure) });
    var group = new Konva.Group({ draggable: true });
    group.add(figure);
    this.layer.add(group);
  }

  onFigureClick(figure: Konva.Rect) {
    if (this.grouping || this.unionising) {
      if (!this.selectedFigure || this.selectedFigure.parent == figure.parent) {
        return;
      }
      var groupToLeave = this.selectedFigure?.parent;
      var commentsSelected = this.getGroupComments(groupToLeave as unknown as Konva.Group);
      var figureComments = this.getFigureComments(this.selectedFigure);
      commentsSelected = commentsSelected?.filter(x => !figureComments?.includes(x));
      var comments = this.getGroupComments(figure.parent as unknown as Konva.Group);
      if (this.grouping) {
        var pos = this.selectedFigure.getAbsolutePosition();
        this.selectedFigure?.remove();
        figureComments?.forEach(x => x.remove());
        commentsSelected?.forEach(x => x.remove());
        if ((groupToLeave?.children?.length || 0) < 2) {
          groupToLeave?.destroy();
        } else {
          this.redrawBorder(groupToLeave);
          this.commentGroup(groupToLeave as unknown as Konva.Group, commentsSelected);
        }
        figure.parent?.add(this.selectedFigure);
        this.selectedFigure.setAbsolutePosition(pos);
        figureComments?.forEach(x => x.remove());
        comments?.forEach(x => x.remove());
        this.redrawBorder(this.selectedFigure.parent);
        this.commentGroup(figure.parent as unknown as Konva.Group, (comments || []).concat(figureComments || []));
      } else {
        comments = (comments || []).concat(commentsSelected || []).concat(figureComments || []);
        comments.forEach(x => {
          x.remove();
        });
        var groupFigs: any = [];
        groupToLeave?.children?.forEach(x => {
          groupFigs.push(x);
        });
        groupFigs.forEach((x: Konva.Node) => {
          var pos = x.getAbsolutePosition();
          x.remove();
          figure.parent?.add(x);
          x.setAbsolutePosition(pos);
        });
        this.redrawBorder(figure.parent);
        this.commentGroup(figure.parent as unknown as Konva.Group, comments);
        groupToLeave?.destroy();
      }
      this.selectedFigure = undefined;
      this.grouping = false;
      this.unionising = false;
    } else {
      this.selectedFigure = figure;
      var stage = this.layer.getStage();
      var containerRect = stage.container().getBoundingClientRect();
      this.pictureMenu.nativeElement.style.display = 'initial';
      this.pictureMenu.nativeElement.style.top = `${containerRect.top + (stage?.getPointerPosition()?.y || 0) + 5}px`;
      this.pictureMenu.nativeElement.style.left = `${containerRect.left + (stage?.getPointerPosition()?.x || 0) + 5}px`;
    }
  }

  groupFiguresClick() {
    this.grouping = true;
    this.hideMenu();
  }

  unionFiguresClick() {
    this.unionising = true;
    this.hideMenu();
  }

  ungroupFigureClick() {
    this.ungroupFigure(this.selectedFigure);
    this.hideMenu();
  }

  commentFigureClick() {
    this.hideMenu();
    this.commentFigure(this.selectedFigure);
  }

  deleteFigureClick() {
    this.deleteFigure(this.selectedFigure);
    this.selectedFigure = undefined;
    this.hideMenu();
  }

  unableToUnion() {
    return !((this.layer.children?.filter(x => (<Konva.Group>x).children?.some(y => y.name() == 'border')).length || 0) > 1 &&
      (this.selectedFigure?.parent?.children?.length || 0) > 1);
  }

  unableToUngroup() {
    return !this.selectedFigure?.parent?.children?.some(x => x.name() == 'border');
  }

  hideMenu() {
    this.pictureMenu.nativeElement.style.display = 'none';
  }

  ungroupFigure(figure: Konva.Rect | undefined) {
    if (!figure) {
      return;
    }
    var pos = figure.getAbsolutePosition();
    var newGroup = new Konva.Group({ draggable: true, x: pos.x, y: pos.y });
    var group = figure.parent;
    var comments = this.getFigureComments(figure);
    var groupComments = group?.children?.filter(x => x.name().length && x.name() != 'border' && !comments?.includes(<Konva.Label>x));
    comments?.forEach(x => x.remove());
    figure.remove();
    groupComments?.forEach(x => x.remove());
    this.redrawBorder(group);
    this.commentGroup(group as unknown as Konva.Group, groupComments);
    newGroup.add(figure);
    this.layer.add(newGroup);
    figure.setAbsolutePosition(pos);
    this.commentGroup(newGroup, comments);
  }

  redrawBorder(group: Konva.Container | null) {
    if (!group) {
      return;
    }

    group.children?.forEach(x => {
      if (x.name() == 'border') {
        x.destroy();
      }
    });

    if ((group.children?.filter(x => !x.name().length).length || 0) < 2) {
      return;
    }

    var rect = group.getClientRect({skipTransform: true});
    var point = { x: (rect.x), y: (rect.y) };
    var borderRect = new Konva.Rect({
      x: point.x - 5,
      y: point.y - 5,
      name: 'border',
      stroke: randomColor(),
      width: (rect.width * group.scaleX()) + 10,
      height: (rect.height * group.scaleY()) + 10,
      fill: 'transparent'
    });
    borderRect.on("click", () => {
      this.grouping = false;
      this.unionising = false;
      this.comment = '';
      this.hideMenu();
    });
    group.add(borderRect);
    borderRect.moveToBottom();
  }

  commentFigure(figure: Konva.Rect | undefined) {
    if (!this.comment.length) {
      return;
    }

    var group = figure?.parent;
    var pos = group?.getClientRect({skipTransform: true});
    var label = new Konva.Label({
      x: (pos?.x || 0),
      y: (pos?.y || 0) + (pos?.height || 0) + 5,
      opacity: 0.75,
      name: figure?._id.toString()
    });
    label.on('click', (e) => { this.deleteComment(<Konva.Shape>e.target) });
    label.add(
      new Konva.Tag({
        stroke: figure?.fill(),
        fill: '#ccc'
      })
    );
    label.add(
      new Konva.Text({
        text: this.comment,
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'black',
      })
    );

    var comments = this.getGroupComments(group as unknown as Konva.Group);
    comments.forEach(x => x.remove());
    comments.push(label);
    this.commentGroup(group as unknown as Konva.Group, comments);
    this.comment = '';
  }

  commentGroup(group: Konva.Group | null, comments: Konva.Node[] | undefined) {
    if (!group || !comments) {
      return;
    }

    comments.sort((a, b) => {
      return a.name() < b.name()
        ? -1
        : a.name() > b.name()
          ? 1
          : 0;
    }).forEach(x => {
      var rect = group.getClientRect({skipTransform: true});
      var pos = {
        x: (rect?.x || 0),
        y: (rect?.y || 0) + (rect?.height || 0) + 5
      };
      x.setAbsolutePosition(pos);
      group?.add(<Konva.Label>x);
    });
  }

  deleteComment(comment: Konva.Shape) {
    var group = comment.parent?.parent;
    comment.parent?.destroy();
    var comments = this.getGroupComments(group as unknown as Konva.Group)?.sort((a, b) => {
      return a.name() < b.name()
        ? -1
        : a.name() > b.name()
          ? 1
          : 0;
    });
    comments?.forEach(x => x.remove());
    this.commentGroup(group as unknown as Konva.Group, comments);
  }

  deleteFigure(figure: Konva.Shape | undefined) {
    var comments = this.getFigureComments(<Konva.Rect>figure);
    comments?.forEach(x => x.destroy());
    var group = figure?.parent;
    var groupComments = this.getGroupComments(group as unknown as Konva.Group);
    figure?.destroy();
    if (group) {
      groupComments.forEach(x => x.remove());
      this.redrawBorder(group);
      this.commentGroup(group as unknown as Konva.Group, groupComments);
    }
  }

  getFigureComments(figure: Konva.Rect | undefined): Konva.Label[] {
    return <Konva.Label[]>figure?.parent?.children?.filter(x => x.name() == figure._id.toString());
  }

  getGroupComments(group: Konva.Group | undefined): Konva.Label[] {
    return <Konva.Label[]>group?.children?.filter(x => x.name().length && x.name() != 'border');
  }

  onSubmit() {
    if (this.form.valid) {
      this.layer.children?.forEach((x) => {
        const group = <Konva.Group>x;
        (<FormArray>this.form.get('figuresGroups')).push(new FormControl(this.getGroupValue(group)));
      });
      this.picturesService.updatePicture(this.form.value).subscribe({
        next: () => {
          this.error = '';
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err.error() || 'Internal server error';
        }
      })
    }
  }

  getGroupValue(group: Konva.Group) {
    return {
      figures: group.children?.filter(x => !x.name().length).map(x => {
        const pos = x.getAbsolutePosition();
        return {
          x: pos.x,
          y: pos.y,
          comments: this.getFigureComments(<Konva.Rect>x).map(x => x.children?.find(y => Konva.Text.prototype.isPrototypeOf(y))?.attrs.text)
        }
      })
    };
  }

  getFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}
