using Lambda.Api.Models;

namespace Lambda.Api.Services;

public interface IUsersService
{
    Task<ICollection<User>> ListAsync();
    Task<User> PostAsync(User user);
}