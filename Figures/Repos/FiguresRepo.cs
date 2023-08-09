using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Figures.Models;
using Figures.Models.Pictures;
using Figures.Repos.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Figures.Repos;

public class FiguresRepo : IRepo<Figure>
{
    private readonly ApplicationContext _db;

    public FiguresRepo(ApplicationContext db)
    {
        _db = db;
    }
    
    public async Task<Figure> Get(long id)
    {
        return await _db.Figures.FirstOrDefaultAsync(x => x.Id == id);
    }
    
    public IEnumerable<Figure> GetByGroupId(long groupId)
    {
        return _db.Figures.AsNoTracking().Where(x => x.FiguresGroupId == groupId).AsEnumerable();
    }

    public async Task<long> Add(Figure entity)
    {
        _db.Figures.Add(entity);
        await _db.SaveChangesAsync();
        return entity.Id;
    }

    public async Task Delete(long id)
    {
        var entity = await _db.Figures.FirstOrDefaultAsync(x => x.Id == id);
        if (entity != null)
        {
            _db.Figures.Remove(entity);
        }
    }

    public void Update(Figure entity)
    {
        _db.Entry(entity).State = EntityState.Modified;
    }
}