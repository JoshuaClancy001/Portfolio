using Portfolio.Common;

namespace Portfolio.Services;

public interface IImageStorageService
{
    Task<Result<string>> UploadAsync(IFormFile file, string folder);
    Task<Result> DeleteAsync(string url);
}
