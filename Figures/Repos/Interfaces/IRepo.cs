using System.Threading.Tasks;

namespace Figures.Repos.Interfaces;

public interface IRepo<T>
{
    public Task<T> Get(long id);
    public Task<long> Add(T entity);
    public Task Delete(long id);
    public void Update(T entity);
}