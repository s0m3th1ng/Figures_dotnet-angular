using System.Collections.Generic;

namespace Figures.Models.ViewModels;

public class UpdatePictureViewModel
{
    public long Id { get; set; }
    public string Name { get; set; }
    public List<FigureGroupViewModel> FiguresGroups { get; set; }
}

public class FigureGroupViewModel
{
    public List<FigureViewModel> Figures { get; set; }
}

public class FigureViewModel
{
    public int X { get; set; }
    public int Y { get; set; }
    public List<string> Comments { get; set; }
}