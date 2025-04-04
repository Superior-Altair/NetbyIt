using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionService.Data;
using TransactionService.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace TransactionService.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly TransactionDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _productServiceUrl = "http://localhost:5007/api/products"; // URL del servicio de productos

        public TransactionsController(TransactionDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            try
            {
                var transactions = await _context.Transactions
                    .Include(t => t.TransactionType)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las transacciones", error = ex.Message });
            }
        }

        // GET: api/transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            try
            {
                var transaction = await _context.Transactions
                    .Include(t => t.TransactionType)
                    .FirstOrDefaultAsync(t => t.TransactionId == id);

                if (transaction == null)
                {
                    return NotFound(new { message = $"No se encontró la transacción con ID {id}" });
                }

                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener la transacción", error = ex.Message });
            }
        }

        // GET: api/transactions/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByProduct(int productId)
        {
            try
            {
                var transactions = await _context.Transactions
                    .Include(t => t.TransactionType)
                    .Where(t => t.ProductId == productId)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las transacciones del producto", error = ex.Message });
            }
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<Transaction>> CreateTransaction(Transaction transaction)
        {
            try
            {
                // Obtener el tipo de transacción
                var transactionType = await _context.TransactionTypes
                    .FirstOrDefaultAsync(t => t.TransactionTypeId == transaction.TransactionTypeId);

                if (transactionType == null)
                {
                    return BadRequest(new { message = "Tipo de transacción no válido" });
                }

                // Obtener el producto actual
                var productResponse = await _httpClient.GetAsync($"{_productServiceUrl}/{transaction.ProductId}");
                if (!productResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "No se pudo obtener la información del producto" });
                }

                var productJson = await productResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Producto obtenido: {productJson}");
                
                var product = JsonSerializer.Deserialize<Product>(productJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Validar stock para ventas
                if (transactionType.Type == "OUT")
                {
                    if (product.Stock < transaction.Quantity)
                    {
                        return BadRequest(new { message = $"Stock insuficiente. Stock actual: {product.Stock}" });
                    }
                }

                // Calcular nuevo stock
                var newStock = transactionType.Type == "IN"
                    ? product.Stock + transaction.Quantity
                    : product.Stock - transaction.Quantity;

                Console.WriteLine($"Nuevo stock calculado: {newStock}");

                // Actualizar stock en el servicio de productos
                var updateStockContent = new StringContent(
                    JsonSerializer.Serialize(new { stock = newStock }),
                    Encoding.UTF8,
                    "application/json");

                var updateResponse = await _httpClient.PutAsync(
                    $"{_productServiceUrl}/{transaction.ProductId}/stock",
                    updateStockContent);

                var updateResponseContent = await updateResponse.Content.ReadAsStringAsync();
                Console.WriteLine($"Respuesta de actualización de stock: {updateResponseContent}");

                if (!updateResponse.IsSuccessStatusCode)
                {
                    return StatusCode(500, new { 
                        message = "Error al actualizar el stock del producto",
                        error = updateResponseContent
                    });
                }

                // Crear la transacción
                transaction.TransactionDate = DateTime.UtcNow;
                transaction.CreatedAt = DateTime.UtcNow;
                transaction.TotalPrice = transaction.Quantity * transaction.UnitPrice;

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                // Cargar el tipo de transacción para la respuesta
                await _context.Entry(transaction)
                    .Reference(t => t.TransactionType)
                    .LoadAsync();

                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.TransactionId }, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en CreateTransaction: {ex}");
                return StatusCode(500, new { message = "Error al crear la transacción", error = ex.Message });
            }
        }

        // PUT: api/transactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, Transaction transaction)
        {
            if (id != transaction.TransactionId)
            {
                return BadRequest(new { message = "El ID de la transacción no coincide" });
            }

            try
            {
                var existingTransaction = await _context.Transactions
                    .Include(t => t.TransactionType)
                    .FirstOrDefaultAsync(t => t.TransactionId == id);

                if (existingTransaction == null)
                {
                    return NotFound(new { message = $"No se encontró la transacción con ID {id}" });
                }

                // Calcular la diferencia en cantidad
                var quantityDiff = transaction.Quantity - existingTransaction.Quantity;

                if (quantityDiff != 0)
                {
                    // Obtener el producto actual
                    var productResponse = await _httpClient.GetAsync($"{_productServiceUrl}/{transaction.ProductId}");
                    if (!productResponse.IsSuccessStatusCode)
                    {
                        return BadRequest(new { message = "No se pudo obtener la información del producto" });
                    }

                    var productJson = await productResponse.Content.ReadAsStringAsync();
                    var product = JsonSerializer.Deserialize<Product>(productJson, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    // Calcular nuevo stock
                    var stockAdjustment = existingTransaction.TransactionType.Type == "IN" ? -quantityDiff : quantityDiff;
                    var newStock = product.Stock + stockAdjustment;

                    if (newStock < 0)
                    {
                        return BadRequest(new { message = "La actualización resultaría en stock negativo" });
                    }

                    // Actualizar stock en el servicio de productos
                    var updateStockContent = new StringContent(
                        JsonSerializer.Serialize(new { stock = newStock }),
                        Encoding.UTF8,
                        "application/json");

                    var updateResponse = await _httpClient.PutAsync(
                        $"{_productServiceUrl}/{transaction.ProductId}/stock",
                        updateStockContent);

                    if (!updateResponse.IsSuccessStatusCode)
                    {
                        return StatusCode(500, new { message = "Error al actualizar el stock del producto" });
                    }
                }

                // Actualizar la transacción
                existingTransaction.TransactionDate = transaction.TransactionDate;
                existingTransaction.TransactionTypeId = transaction.TransactionTypeId;
                existingTransaction.ProductId = transaction.ProductId;
                existingTransaction.Quantity = transaction.Quantity;
                existingTransaction.UnitPrice = transaction.UnitPrice;
                existingTransaction.TotalPrice = transaction.Quantity * transaction.UnitPrice;
                existingTransaction.Details = transaction.Details;

                await _context.SaveChangesAsync();

                return Ok(existingTransaction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar la transacción", error = ex.Message });
            }
        }

        // DELETE: api/transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            try
            {
                var transaction = await _context.Transactions
                    .Include(t => t.TransactionType)
                    .FirstOrDefaultAsync(t => t.TransactionId == id);

                if (transaction == null)
                {
                    return NotFound(new { message = $"No se encontró la transacción con ID {id}" });
                }

                // Obtener el producto actual
                var productResponse = await _httpClient.GetAsync($"{_productServiceUrl}/{transaction.ProductId}");
                if (!productResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "No se pudo obtener la información del producto" });
                }

                var productJson = await productResponse.Content.ReadAsStringAsync();
                var product = JsonSerializer.Deserialize<Product>(productJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Calcular nuevo stock
                var stockAdjustment = transaction.TransactionType.Type == "IN" ? -transaction.Quantity : transaction.Quantity;
                var newStock = product.Stock + stockAdjustment;

                if (newStock < 0)
                {
                    return BadRequest(new { message = "La eliminación resultaría en stock negativo" });
                }

                // Actualizar stock en el servicio de productos
                var updateStockContent = new StringContent(
                    JsonSerializer.Serialize(new { stock = newStock }),
                    Encoding.UTF8,
                    "application/json");

                var updateResponse = await _httpClient.PutAsync(
                    $"{_productServiceUrl}/{transaction.ProductId}/stock",
                    updateStockContent);

                if (!updateResponse.IsSuccessStatusCode)
                {
                    return StatusCode(500, new { message = "Error al actualizar el stock del producto" });
                }

                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Transacción eliminada correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar la transacción", error = ex.Message });
            }
        }

        private bool TransactionExists(int id)
        {
            return _context.Transactions.Any(e => e.TransactionId == id);
        }
    }

    public class Product
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public int Stock { get; set; }
    }
} 