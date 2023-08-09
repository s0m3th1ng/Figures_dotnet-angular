namespace Figures.Models.Pictures;

public class Comment
{
    public long Id { get; set; }
    public string Value { get; set; }
    public long FigureId { get; set; }
    public long FiguresGroupId { get; set; }
}