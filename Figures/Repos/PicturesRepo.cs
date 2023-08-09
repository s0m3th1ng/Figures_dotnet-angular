using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Figures.Models;
using Figures.Models.Pictures;
using Figures.Models.ViewModels;
using Figures.Repos.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Figures.Repos;

public class PicturesRepo : IRepo<Picture>
{
    private readonly ApplicationContext _db;

    public PicturesRepo(ApplicationContext db)
    {
        _db = db;
    }

    public async Task<Picture> Get(long id)
    {
        return await _db.Pictures
            .Include(x => x.FiguresGroups)
                .ThenInclude(x => x.Figures)
            .Include(x => x.FiguresGroups)
                .ThenInclude(x => x.Comments)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public IEnumerable<Picture> GetByUserId(string userId)
    {
        return _db.Pictures
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .AsEnumerable();
    }

    public async Task<long> Add(Picture entity)
    {
        _db.Pictures.Add(entity);
        await _db.SaveChangesAsync();
        return entity.Id;
    }

    public async Task Delete(long id)
    {
        var entity = await _db.Pictures.FirstOrDefaultAsync(x => x.Id == id);
        if (entity != null)
        {
            _db.Pictures.Remove(entity);
        }
    }

    public void DeleteRange(IEnumerable<long> ids, string userId)
    {
        var entities = _db.Pictures.Where(x => ids.Contains(x.Id) && x.UserId == userId);
        _db.Pictures.RemoveRange(entities);
    }
    
    public void Update(Picture entity)
    {
        _db.Entry(entity).State = EntityState.Modified;
    }

    public void Update(UpdatePictureViewModel entity)
    {
        var picture = _db.Pictures.FirstOrDefault(x => x.Id == entity.Id);
        if (picture == null)
        {
            return;
        }
        
        _db.FiguresGroups.RemoveRange(picture.FiguresGroups);
        picture.Name = entity.Name;
        picture.Changed = DateTime.Now;
        picture.FiguresCount = entity.FiguresGroups.SelectMany(x => x.Figures).Count();
        picture.FiguresGroups = new List<FiguresGroup>();
        foreach (var group in entity.FiguresGroups)
        {
            var newGroup = new FiguresGroup()
            {
                Figures = new List<Figure>(),
                Comments = new List<Comment>()
            };
            picture.FiguresGroups.Add(newGroup);
            foreach (var figure in group.Figures)
            {
                var newFigure = new Figure()
                {
                    X = figure.X,
                    Y = figure.Y
                };
                newGroup.Figures.Add(newFigure);
                _db.SaveChanges();
                foreach (var comment in figure.Comments)
                {
                    var newComment = new Comment()
                    {
                        FigureId = newFigure.Id,
                        Value = comment
                    };
                    newGroup.Comments.Add(newComment);
                }
            }
        }
        _db.SaveChanges();
    }
}