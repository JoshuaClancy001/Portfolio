using Portfolio.Common;
using Portfolio.DTOs;

namespace Portfolio.Services;

public interface IMessageService
{
    Task<Result<List<MessageResponse>>> GetAllAsync();
    Task<Result> AddAsync(CreateMessageRequest request);
    Task<Result> MarkReadAsync(Guid id);
}
