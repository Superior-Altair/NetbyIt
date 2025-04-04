# Sistema de Gestión de Inventarios

Este proyecto implementa un sistema de gestión de inventarios utilizando una arquitectura de microservicios con .NET Core en el backend y React en el frontend.

## Estructura del Proyecto

```
├── backend/
│   ├── ProductService/       # Microservicio de Productos
│   └── TransactionService/   # Microservicio de Transacciones
├── frontend/                 # Aplicación React
└── database/                 # Scripts SQL
```

## Requisitos

### Backend
- .NET Core SDK 7.0 o superior
- SQL Server 2019 o superior
- Visual Studio 2022 o VS Code

### Frontend
- Node.js 18.x o superior
- npm 9.x o superior

## Configuración del Entorno

### Base de Datos
1. Ejecutar el script de creación de base de datos ubicado en `database/init.sql`
2. Configurar las cadenas de conexión en los archivos `appsettings.json` de cada microservicio

### Backend
1. Navegar a cada directorio de microservicio:
   ```bash
   cd backend/ProductService
   dotnet restore
   dotnet run
   ```
   Repetir para TransactionService

### Frontend
1. Navegar al directorio frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Características Principales
- Gestión completa de productos (CRUD)
- Registro de transacciones de inventario
- Búsqueda y filtrado avanzado
- Validaciones de stock
- Interfaz de usuario intuitiva y responsive

## API Endpoints

### Productos
- GET /api/products - Listar productos
- POST /api/products - Crear producto
- PUT /api/products/{id} - Actualizar producto
- DELETE /api/products/{id} - Eliminar producto

### Transacciones
- GET /api/transactions - Listar transacciones
- POST /api/transactions - Crear transacción
- GET /api/transactions/product/{productId} - Obtener transacciones por producto 