using System.ComponentModel.DataAnnotations;

namespace TransactionService.Models
{
    public class Transaction
    {
        public int TransactionId { get; set; }

        [Required(ErrorMessage = "La fecha de transacción es requerida")]
        public DateTime TransactionDate { get; set; }

        [Required(ErrorMessage = "El tipo de transacción es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un tipo de transacción válido")]
        public int TransactionTypeId { get; set; }

        public TransactionType? TransactionType { get; set; }

        [Required(ErrorMessage = "El producto es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un producto válido")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "El precio unitario es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio unitario debe ser mayor a 0")]
        public decimal UnitPrice { get; set; }

        [Required(ErrorMessage = "El precio total es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio total debe ser mayor a 0")]
        public decimal TotalPrice { get; set; }

        [StringLength(500, ErrorMessage = "Los detalles no pueden exceder los 500 caracteres")]
        public string? Details { get; set; }

        public DateTime CreatedAt { get; set; }
    }
} 