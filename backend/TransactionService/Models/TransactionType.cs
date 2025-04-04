using System.ComponentModel.DataAnnotations;

namespace TransactionService.Models
{
    public class TransactionType
    {
        public int TransactionTypeId { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        [StringLength(3)]
        public string Type { get; set; } // IN o OUT
    }
} 