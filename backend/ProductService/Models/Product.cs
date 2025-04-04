using System.ComponentModel.DataAnnotations;

namespace ProductService.Models
{
    public class Product
    {
        public int ProductId { get; set; }

        [Required(ErrorMessage = "El nombre del producto es requerido")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 200 caracteres")]
        public required string Name { get; set; }

        [StringLength(1000, ErrorMessage = "La descripción no puede exceder los 1000 caracteres")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "La categoría es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar una categoría válida")]
        public int CategoryId { get; set; }

        public Category? Category { get; set; }

        [StringLength(500, ErrorMessage = "La URL de la imagen no puede exceder los 500 caracteres")]
        [RegularExpression(@"^(/images/products/.*|https?://.*|)$", 
            ErrorMessage = "La URL de la imagen debe comenzar con /images/products/ o ser una URL válida")]
        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "El precio es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "El stock es requerido")]
        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 