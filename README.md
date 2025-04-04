# Sistema de Gestión de Inventarios

Sistema completo para la gestión de inventarios que permite administrar productos, categorías y transacciones de manera eficiente. Desarrollado con React y Material-UI en el frontend, y .NET Core en el backend.

## Características Principales

### Gestión de Productos
- Crear, editar y eliminar productos
- Asignar categorías
- Gestionar stock y precios
- Subir imágenes de productos
- Filtrado avanzado por nombre, categoría y stock
- Vista en tabla con paginación

### Gestión de Categorías
- Crear, editar y eliminar categorías
- Validación para evitar eliminación de categorías con productos asociados
- Interfaz intuitiva para la gestión

### Dashboard
- Vista general del inventario:
  - Total de productos
  - Total de categorías
  - Productos con stock bajo
  - Valor total del inventario
- Listado de productos con stock bajo

### Transacciones
- Registro de movimientos de inventario
- Historial detallado de transacciones
- Validaciones de stock

## Tecnologías Utilizadas

### Frontend
- React 18
- TypeScript
- Material-UI v5
- React Query
- React Router
- Notistack para notificaciones
- Axios para peticiones HTTP

### Backend
- .NET Core 7.0
- SQL Server 2019
- Entity Framework Core
- Swagger para documentación de API

## Requisitos Previos

### Desarrollo
- Node.js 18.x o superior
- npm 9.x o superior
- .NET Core SDK 7.0 o superior
- SQL Server 2019 o superior
- Visual Studio 2022 o VS Code


## Instalación y Configuración

### Base de Datos
1. Crear una nueva base de datos en SQL Server
2. Ejecutar los scripts de migración:
   ```bash
   cd backend/Database
   dotnet ef database update
   ```

### Backend
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Superior-Altair/NetbyIt.git
   ```

2. Configurar el archivo `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=Inventario;Trusted_Connection=True;"
     }
   }
   ```

3. Iniciar los servicios:
   ```bash
   cd backend/ProductService
   dotnet run
   
   cd backend/TransactionService
   dotnet run
   ```

### Frontend
1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con las URLs de los servicios

   ejemplo: http://localhost:5008

3. Iniciar la aplicación:
   ```bash
   npm start
   ```
