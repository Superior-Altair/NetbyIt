using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TransactionService.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTransactionTypeRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_TransactionTypes_TransactionTypeId1",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TransactionTypeId1",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "TransactionTypeId1",
                table: "Transactions");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "TransactionTypes",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "TransactionTypes",
                columns: new[] { "TransactionTypeId", "Name", "Type" },
                values: new object[,]
                {
                    { 1, "Compra", "IN" },
                    { 2, "Venta", "OUT" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TransactionTypes",
                keyColumn: "TransactionTypeId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "TransactionTypes",
                keyColumn: "TransactionTypeId",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TransactionTypes");

            migrationBuilder.AddColumn<int>(
                name: "TransactionTypeId1",
                table: "Transactions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransactionTypeId1",
                table: "Transactions",
                column: "TransactionTypeId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_TransactionTypes_TransactionTypeId1",
                table: "Transactions",
                column: "TransactionTypeId1",
                principalTable: "TransactionTypes",
                principalColumn: "TransactionTypeId");
        }
    }
}
