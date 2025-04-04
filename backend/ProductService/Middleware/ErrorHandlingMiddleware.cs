using System.Net;
using System.Text.Json;

namespace ProductService.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public class ErrorResponse
    {
        public string Message { get; set; }
        public string? Details { get; set; }
        public string? StackTrace { get; set; }
    }

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no manejado en la aplicación");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var response = new ErrorResponse();

        switch (exception)
        {
            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = "El recurso solicitado no fue encontrado.";
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = "No está autorizado para acceder a este recurso.";
                break;

            case ArgumentException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Solicitud inválida.";
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "Ha ocurrido un error interno en el servidor.";
                break;
        }

        response.Details = exception.Message;
#if DEBUG
        response.StackTrace = exception.StackTrace;
#endif

        var result = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(result);
    }
} 