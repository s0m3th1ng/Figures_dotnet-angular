using System;

namespace Figures.Repos.Interfaces;

public interface IUnitOfWork : IDisposable
{
    public void Save();
}