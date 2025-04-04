using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<ProductDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.EnableSensitiveDataLogging();
});

// Add CORS with specific origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        builder =>
        {
            builder
                .WithOrigins(
                    "http://localhost:3000",     // Frontend
                    "http://localhost:5008"      // TransactionService
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ProductDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Configurar los puertos en desarrollo
    app.Urls.Clear();
    app.Urls.Add("http://localhost:5007");
}

// Usar el middleware de manejo de errores
app.UseMiddleware<ErrorHandlingMiddleware>();

// Usar CORS antes de los endpoints
app.UseCors("AllowSpecificOrigins");

// Habilitar archivos estáticos
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

// Agregar endpoint de prueba
app.MapGet("/", () => "API de Productos funcionando!");

app.MapControllers();

app.Run();
