using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace ProductService.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly ILogger<ProductsController> _logger;
        private readonly IWebHostEnvironment _environment;

        public ProductsController(ProductDbContext context, ILogger<ProductsController> logger, IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new 
                    { 
                        message = "Datos del producto inválidos",
                        errors = ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage)
                    });
                }

                _logger.LogInformation("Creando producto: {@Product}", product);

                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                var createdProduct = await _context.Products
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);

                return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, createdProduct);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error al guardar el producto en la base de datos: {@Product}", product);
                return StatusCode(500, new { 
                    message = "Error al crear el producto en la base de datos",
                    error = ex.InnerException?.Message ?? ex.Message,
                    details = ex.InnerException?.ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al crear el producto: {@Product}", product);
                return StatusCode(500, new { 
                    message = "Error inesperado al crear el producto",
                    error = ex.Message,
                    details = ex.ToString()
                });
            }
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.ProductId)
            {
                return BadRequest();
            }

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.ImageUrl = product.ImageUrl;
            existingProduct.Price = product.Price;
            existingProduct.Stock = product.Stock;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(existingProduct);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                throw;
            }
        }

        // PUT: api/products/5/stock
        [HttpPut("{id}/stock")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockRequest request)
        {
            _logger.LogInformation($"Actualizando stock del producto {id} a {request.Stock}");

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                _logger.LogWarning($"No se encontró el producto con ID {id}");
                return NotFound(new { message = $"No se encontró el producto con ID {id}" });
            }

            try
            {
                _logger.LogInformation($"Stock actual: {product.Stock}, Nuevo stock: {request.Stock}");
                product.Stock = request.Stock;
                product.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Stock actualizado correctamente para el producto {id}");

                return Ok(await _context.Products
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.ProductId == id));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el stock del producto {id}");
                return StatusCode(500, new { message = "Error al actualizar el stock", error = ex.Message });
            }
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            try
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Producto eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el producto", error = ex.Message });
            }
        }

        // POST: api/Products/{id}/image
        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImage(int id, IFormFile image)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "No se ha proporcionado una imagen" });
            }

            try
            {
                // Crear el directorio de imágenes si no existe
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "products");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generar un nombre único para el archivo
                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Eliminar la imagen anterior si existe
                if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_environment.WebRootPath, product.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                        catch (IOException)
                        {
                            // Ignorar errores al eliminar la imagen anterior
                            _logger.LogWarning("No se pudo eliminar la imagen anterior: {Path}", oldImagePath);
                        }
                    }
                }

                // Guardar la nueva imagen usando Stream
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Actualizar la URL de la imagen en la base de datos
                product.ImageUrl = $"/images/products/{uniqueFileName}";
                await _context.SaveChangesAsync();

                return Ok(new { imageUrl = product.ImageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir la imagen para el producto {ProductId}", id);
                return StatusCode(500, new { message = "Error al subir la imagen", error = ex.Message });
            }
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductId == id);
        }
    }

    public class UpdateStockRequest
    {
        public int Stock { get; set; }
    }
} 