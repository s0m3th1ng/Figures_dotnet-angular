using System.Collections.Generic;

namespace Figures.Models.Pictures;

public class FiguresGroup
{
    public long Id { get; set; }
    public long PictureId { get; set; }
    public List<Figure> Figures { get; set; }
    public List<Comment> Comments { get; set; }
}