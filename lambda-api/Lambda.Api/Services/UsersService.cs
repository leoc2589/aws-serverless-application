using Lambda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lambda.Api.Services;

public class UsersService : IUsersService
{
    private readonly TestContext _context;

    public UsersService(TestContext context)
    {
        _context = context;
    }

    public async Task<ICollection<User>> ListAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User> PostAsync(User user)
    {
        var entity = await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return entity.Entity;
    }
}