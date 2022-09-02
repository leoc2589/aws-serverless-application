using Lambda.Api.Models;
using Lambda.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Lambda.Api.Controllers;

[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _service;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUsersService service,
        ILogger<UsersController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// List of users.
    /// </summary>
    /// <response code="200">Success</response>
    [HttpGet]
    public async Task<ActionResult<ICollection<User>>> ListAsync()
    {
        return Ok(await _service.ListAsync());
    }

    /// <summary>
    /// Create user.
    /// </summary>
    /// <param name="user"></param>
    /// <response code="200">Success</response>
    /// <response code="400">Bad Request</response>
    [HttpPost]
    public async Task<ActionResult<User>> PostAsync([FromBody] User user)
    {
        if (string.IsNullOrEmpty(user.FirstName) && string.IsNullOrEmpty(user.LastName))
            return BadRequest();

        return Ok(await _service.PostAsync(user));
    }
}