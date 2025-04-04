-- Crear la base de datos
CREATE DATABASE InventoryDB;
GO

USE InventoryDB;
GO

-- Crear tabla de Categorías
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500)
);

-- Crear tabla de Productos
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    CategoryId INT FOREIGN KEY REFERENCES Categories(CategoryId),
    ImageUrl NVARCHAR(500),
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Crear tabla de Tipos de Transacción
CREATE TABLE TransactionTypes (
    TransactionTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL
);

-- Crear tabla de Transacciones
CREATE TABLE Transactions (
    TransactionId INT IDENTITY(1,1) PRIMARY KEY,
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    TransactionTypeId INT FOREIGN KEY REFERENCES TransactionTypes(TransactionTypeId),
    ProductId INT FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    Details NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Insertar datos iniciales
INSERT INTO TransactionTypes (Name) VALUES ('Compra'), ('Venta');

INSERT INTO Categories (Name, Description)
VALUES 
    ('Electrónicos', 'Productos electrónicos y gadgets'),
    ('Ropa', 'Vestimenta y accesorios'),
    ('Hogar', 'Artículos para el hogar');

-- Crear índices
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Transactions_ProductId ON Transactions(ProductId);
CREATE INDEX IX_Transactions_TransactionTypeId ON Transactions(TransactionTypeId);
CREATE INDEX IX_Transactions_TransactionDate ON Transactions(TransactionDate);

-- Crear procedimiento almacenado para actualizar stock
CREATE PROCEDURE sp_UpdateProductStock
    @ProductId INT,
    @Quantity INT,
    @IsAddition BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @IsAddition = 1
        UPDATE Products 
        SET Stock = Stock + @Quantity,
            UpdatedAt = GETDATE()
        WHERE ProductId = @ProductId;
    ELSE
        UPDATE Products 
        SET Stock = Stock - @Quantity,
            UpdatedAt = GETDATE()
        WHERE ProductId = @ProductId;
END;
GO

-- Crear trigger para actualizar stock automáticamente
CREATE TRIGGER tr_UpdateStock
ON Transactions
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ProductId INT;
    DECLARE @Quantity INT;
    DECLARE @TransactionTypeId INT;
    
    SELECT 
        @ProductId = ProductId,
        @Quantity = Quantity,
        @TransactionTypeId = TransactionTypeId
    FROM inserted;
    
    -- Si es compra (1) aumentamos stock, si es venta (2) disminuimos
    EXEC sp_UpdateProductStock 
        @ProductId = @ProductId,
        @Quantity = @Quantity,
        @IsAddition = CASE WHEN @TransactionTypeId = 1 THEN 1 ELSE 0 END;
END;
GO 