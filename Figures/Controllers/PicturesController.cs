using System.Collections.Generic;
using System.Threading.Tasks;
using Figures.Models.Pictures;
using Figures.Models.ViewModels;
using Figures.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Figures.Controllers;

[Route("api/[controller]")]
public class PicturesController : Controller
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly UnitOfWork _unitOfWork;
    
    public PicturesController(
        UserManager<IdentityUser> userManager,
        UnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    [HttpGet, Authorize]
    public IActionResult Get()
    {
        var userId = _userManager.GetUserId(User);
        var data = _unitOfWork.Pictures.GetByUserId(userId);
        return Ok(data);
    }

    [HttpGet("GetById"), Authorize]
    public async Task<IActionResult> GetById([FromQuery] long id)
    {
        var userId = _userManager.GetUserId(User);
        var data = await _unitOfWork.Pictures.Get(id);
        if (data == null || data.UserId != userId)
        {
            return BadRequest("Access restricted");
        }

        return Ok(data);
    }

    [HttpPost("Add"), Authorize]
    public async Task<IActionResult> Add([FromBody] Picture picture)
    {
        var userId = _userManager.GetUserId(User);
        picture.UserId = userId;
        var pictureId = await _unitOfWork.Pictures.Add(picture);
        return Ok(pictureId);
    }

    [HttpPut, Authorize]
    public async Task<IActionResult> Update([FromBody] UpdatePictureViewModel picture)
    {
        var pictureDb = await _unitOfWork.Pictures.Get(picture.Id);
        if (pictureDb == null || pictureDb.UserId != _userManager.GetUserId(User))
        {
            return BadRequest();
        }
        
        _unitOfWork.Pictures.Update(picture);
        _unitOfWork.Save();
        return Ok();
    }

    [HttpPost("Delete"), Authorize]
    public IActionResult Delete([FromBody] List<long> ids)
    {
        var userId = _userManager.GetUserId(User);
        _unitOfWork.Pictures.DeleteRange(ids, userId);
        _unitOfWork.Save();
        return Ok();
    }
}