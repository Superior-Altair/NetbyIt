using System;

namespace TransactionService.Models.DTOs
{
    public class TransactionResponseDTO
    {
        public int TransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionTypeName { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string Details { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 