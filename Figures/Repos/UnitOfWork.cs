using System;
using Figures.Models;
using Figures.Repos.Interfaces;

namespace Figures.Repos;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationContext _db;
    private PicturesRepo _picturesRepo;
    private FiguresGroupsRepo _figuresGroupsRepo;
    private FiguresRepo _figuresRepo;

    public UnitOfWork(ApplicationContext db)
    {
        _db = db;
    }
 
    public PicturesRepo Pictures => _picturesRepo ??= new PicturesRepo(_db); 
    public FiguresGroupsRepo FiguresGroups => _figuresGroupsRepo ??= new FiguresGroupsRepo(_db); 
    public FiguresRepo Figures => _figuresRepo ??= new FiguresRepo(_db);

    public void Save()
    {
        _db.SaveChanges();
    }
 
    private bool disposed = false;
 
    public virtual void Dispose(bool disposing)
    {
        if (disposed)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            disposed = true;
        }
    }
 
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}