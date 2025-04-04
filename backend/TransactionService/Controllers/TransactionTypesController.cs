using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionService.Data;
using TransactionService.Models;

namespace TransactionService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionTypesController : ControllerBase
    {
        private readonly TransactionDbContext _context;

        public TransactionTypesController(TransactionDbContext context)
        {
            _context = context;
        }

        // GET: api/transactiontypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionType>>> GetTransactionTypes()
        {
            return await _context.TransactionTypes.ToListAsync();
        }

        // GET: api/transactiontypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionType>> GetTransactionType(int id)
        {
            var transactionType = await _context.TransactionTypes.FindAsync(id);

            if (transactionType == null)
            {
                return NotFound();
            }

            return transactionType;
        }

        // POST: api/transactiontypes
        [HttpPost]
        public async Task<ActionResult<TransactionType>> CreateTransactionType(TransactionType transactionType)
        {
            _context.TransactionTypes.Add(transactionType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactionType), new { id = transactionType.TransactionTypeId }, transactionType);
        }

        // PUT: api/transactiontypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransactionType(int id, TransactionType transactionType)
        {
            if (id != transactionType.TransactionTypeId)
            {
                return BadRequest();
            }

            var existingTransactionType = await _context.TransactionTypes.FindAsync(id);
            if (existingTransactionType == null)
            {
                return NotFound();
            }

            existingTransactionType.Name = transactionType.Name;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionTypeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/transactiontypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransactionType(int id)
        {
            var transactionType = await _context.TransactionTypes.FindAsync(id);
            if (transactionType == null)
            {
                return NotFound();
            }

            _context.TransactionTypes.Remove(transactionType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransactionTypeExists(int id)
        {
            return _context.TransactionTypes.Any(e => e.TransactionTypeId == id);
        }
    }
} 