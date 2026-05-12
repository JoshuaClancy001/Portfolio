using Portfolio.Common;

namespace Portfolio.Services;

public class SupabaseStorageService : IImageStorageService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _supabaseUrl;
    private readonly string _serviceKey;
    private const string Bucket = "project-images";

    public SupabaseStorageService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _supabaseUrl = (Environment.GetEnvironmentVariable("SUPABASE_URL") ?? config["SUPABASE_URL"] ?? "").TrimEnd('/');
        _serviceKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_KEY") ?? config["SUPABASE_SERVICE_KEY"] ?? "";
    }

    public async Task<Result<string>> UploadAsync(IFormFile file, string folder)
    {
        if (string.IsNullOrEmpty(_supabaseUrl) || string.IsNullOrEmpty(_serviceKey))
            return Result<string>.Fail("Supabase storage is not configured.");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return Result<string>.Fail("Only JPEG, PNG, WebP, and GIF images are allowed.");

        if (file.Length > 5 * 1024 * 1024)
            return Result<string>.Fail("Image must be under 5 MB.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var path = $"{folder}/{Guid.NewGuid()}{ext}";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_serviceKey}");
        client.DefaultRequestHeaders.Add("apikey", _serviceKey);

        using var stream = file.OpenReadStream();
        using var content = new StreamContent(stream);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);

        var response = await client.PostAsync($"{_supabaseUrl}/storage/v1/object/{Bucket}/{path}", content);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            return Result<string>.Fail($"Upload failed: {body}");
        }

        return Result<string>.Ok($"{_supabaseUrl}/storage/v1/object/public/{Bucket}/{path}");
    }

    public async Task<Result> DeleteAsync(string url)
    {
        if (string.IsNullOrEmpty(_supabaseUrl) || string.IsNullOrEmpty(_serviceKey))
            return Result.Fail("Supabase storage is not configured.");

        var prefix = $"{_supabaseUrl}/storage/v1/object/public/{Bucket}/";
        if (!url.StartsWith(prefix))
            return Result.Fail("URL does not belong to this bucket.");

        var path = url[prefix.Length..];

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_serviceKey}");
        client.DefaultRequestHeaders.Add("apikey", _serviceKey);

        var request = new HttpRequestMessage(HttpMethod.Delete,
            $"{_supabaseUrl}/storage/v1/object/{Bucket}/{path}");
        var response = await client.SendAsync(request);

        return response.IsSuccessStatusCode ? Result.Ok() : Result.Fail("Delete failed.");
    }
}
