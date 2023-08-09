using System;
using System.Collections.Generic;

namespace Figures.Models.Pictures;

public class Picture
{
    public long Id { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; }
    public int FiguresCount { get; set; }
    public DateTime Changed { get; set; }
    public List<FiguresGroup> FiguresGroups { get; set; }
}