using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Figures.Models;
using Figures.Models.Pictures;
using Figures.Repos.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Figures.Repos;

public class FiguresGroupsRepo : IRepo<FiguresGroup>
{
    private readonly ApplicationContext _db;

    public FiguresGroupsRepo(ApplicationContext db)
    {
        _db = db;
    }
    
    public async Task<FiguresGroup> Get(long id)
    {
        return await _db.FiguresGroups
            .Include(x => x.Figures)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public IEnumerable<FiguresGroup> GetByPictureId(long pictureId)
    {
        return _db.FiguresGroups
            .Include(x => x.Figures)
            .AsNoTracking()
            .Where(x => x.PictureId == pictureId)
            .AsEnumerable();
    }
    
    public async Task<long> Add(FiguresGroup entity)
    {
        _db.FiguresGroups.Add(entity);
        await _db.SaveChangesAsync();
        return entity.Id;
    }

    public async Task Delete(long id)
    {
        var entity = await _db.FiguresGroups.FirstOrDefaultAsync(x => x.Id == id);
        if (entity != null)
        {
            _db.FiguresGroups.Remove(entity);
        }
    }

    public void Update(FiguresGroup entity)
    {
        _db.Entry(entity).State = EntityState.Modified;
    }
}