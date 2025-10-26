<div align="center">

<img src="https://github.com/Fredy-Fasbear-Industries/fredy-fasbear-prestamos/blob/main/BACKEND/assets/images/ICON.jpg" alt="Fredy Fasbear Logo" width="200"/>

# Fredy Fasbear Préstamos

### Sistema Integral de Gestión de Empeños y Préstamos

![Version](https://img.shields.io/badge/version-1.0.0-D4AF37?style=for-the-badge)
![License](https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-2C3E50?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**Tu aliado financiero de confianza**

[Características](#-características) •
[Instalación](#-instalación) •
[Configuración](#%EF%B8%8F-configuración) •
[Uso](#-uso) •
[Documentación](#-documentación)

</div>

---

## 📋 Descripción

**Fredy Fasbear Préstamos** es un sistema completo y profesional para la gestión de casas de empeño y préstamos. Permite administrar todo el ciclo de vida de préstamos prendarios, desde la solicitud inicial hasta el pago final, con funcionalidades adicionales de e-commerce para la venta de artículos no reclamados.

## ✨ Características

### 🎯 Funcionalidades Principales

- **Gestión Completa de Préstamos**
  - Solicitudes de préstamo en línea
  - Evaluación y avalúo de artículos
  - Generación automática de contratos
  - Firma digital de contratos
  - Sistema de pagos con validación
  - Recibos en PDF con envío por email

- **Multi-Rol de Usuarios**
  - 👤 **Clientes**: Solicitar préstamos, realizar pagos, comprar en tienda
  - 🔍 **Evaluadores**: Avaluar artículos, aprobar/rechazar solicitudes
  - 💰 **Cobradores**: Validar pagos, gestionar cobranzas
  - 👨‍💼 **Administradores**: Control total del sistema

- **E-Commerce Integrado**
  - Tienda en línea de artículos
  - Carrito de compras
  - Gestión de pedidos
  - Sistema de pagos con transferencia bancaria
  - Estados de pedido en tiempo real

- **Sistema de Seguridad Robusto**
  - Autenticación JWT
  - Verificación de email
  - Recuperación de contraseña
  - Rate limiting
  - Logs de auditoría
  - Encriptación de contraseñas con bcrypt

- **Reportes y Análisis**
  - Dashboard con métricas en tiempo real
  - Reportes de préstamos
  - Reportes de pagos
  - Estadísticas de ventas
  - Logs de actividad del sistema

- **Gestión Documental**
  - Carga de comprobantes de pago
  - Generación de contratos PDF
  - Generación de recibos PDF
  - Almacenamiento seguro de documentos
  - Sistema de backups automatizado

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** v18+ - Entorno de ejecución
- **Express** v5 - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **PDFKit** - Generación de documentos PDF
- **Resend** - Servicio de emails transaccionales
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos
- **Express Rate Limit** - Protección contra ataques

### Frontend
- **Nuxt 3** - Framework Vue.js
- **Vue 3** - Framework JavaScript reactivo
- **Pinia** - Gestión de estado
- **Chart.js** - Gráficas y visualizaciones

### DevOps
- **Node Cron** - Tareas programadas
- **Compression** - Compresión de respuestas
- **Helmet** - Seguridad HTTP headers
- **Morgan** - Logging de peticiones HTTP
- **CORS** - Control de acceso entre dominios

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **PostgreSQL** >= 14.0
- **Git**

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/VonDefiant/fredy-fasbear-prestamos.git
cd fredy-fasbear-prestamos
```

### 2. Instalación del Backend

```bash
cd BACKEND
npm install
```

### 3. Instalación del Frontend

```bash
cd ../FRONTEND
npm install
```

## ⚙️ Configuración

### Backend (.env)

Crea un archivo `.env` en la carpeta `BACKEND/` con las siguientes variables:

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/fredy_fasbear_db"

# JWT
JWT_SECRET="tu_clave_secreta_super_segura_aqui"
JWT_EXPIRES_IN="7d"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Puerto del Servidor
PORT=3001

# Email (Resend)
RESEND_API_KEY="tu_api_key_de_resend"
RESEND_FROM_NAME="Fredy Fasbear Préstamos"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Información de la Empresa
EMPRESA_NOMBRE="Fredy Fasbear Préstamos"
EMPRESA_TELEFONO="+502 0000-0000"
EMPRESA_EMAIL="info@fredyfasbear.tech"
EMPRESA_DIRECCION="Guatemala, Guatemala"

# Node Environment
NODE_ENV="development"
```

### Frontend (.env)

Crea un archivo `.env` en la carpeta `FRONTEND/` con:

```env
# API Base URL
NUXT_PUBLIC_API_BASE="http://localhost:3001/api"
```

### Base de Datos

#### 1. Crear la base de datos

```bash
createdb fredy_fasbear_db
```

#### 2. Generar el cliente de Prisma

```bash
cd BACKEND
npm run db:generate
```

#### 3. Aplicar migraciones

```bash
npm run db:migrate
```

#### 4. Poblar con datos iniciales (opcional)

```bash
npm run db:seed
```

## 🎮 Uso

### Desarrollo

#### Iniciar Backend

```bash
cd BACKEND
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

#### Iniciar Frontend

```bash
cd FRONTEND
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción

#### Backend

```bash
cd BACKEND
npm start
```

#### Frontend

```bash
cd FRONTEND
npm run build
npm run start
```

## 📁 Estructura del Proyecto

```
fredy-fasbear-prestamos/
├── BACKEND/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de base de datos
│   │   ├── migrations/            # Migraciones
│   │   └── seed.js               # Datos iniciales
│   ├── src/
│   │   ├── controllers/          # Controladores de lógica de negocio
│   │   ├── routes/               # Definición de rutas API
│   │   ├── middleware/           # Middleware de autenticación, validación
│   │   ├── services/             # Servicios (email, PDF, uploads)
│   │   ├── config/               # Configuraciones
│   │   └── app.js               # Punto de entrada del servidor
│   ├── uploads/                  # Archivos subidos
│   └── package.json
│
├── FRONTEND/
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── admin/               # Panel de administración
│   │   ├── empeno/              # Módulo de préstamos
│   │   ├── evaluador/           # Panel de evaluadores
│   │   ├── collector/           # Panel de cobradores
│   │   └── tienda/              # E-commerce
│   ├── components/              # Componentes reutilizables
│   ├── composables/             # Composables de Vue
│   ├── middleware/              # Middleware de rutas
│   ├── plugins/                 # Plugins de Nuxt
│   ├── assets/                  # Recursos estáticos
│   └── package.json
│
├── DOCUMENTACION/               # Documentación del proyecto
└── SCRIPTS Y CONFIGURACION/    # Scripts útiles
```

## 👥 Roles de Usuario

### 1. Cliente
- Crear solicitudes de préstamo
- Ver estado de solicitudes
- Firmar contratos digitalmente
- Realizar pagos
- Descargar recibos
- Comprar en tienda

### 2. Evaluador
- Recibir y evaluar solicitudes
- Realizar avalúos de artículos
- Aprobar/rechazar solicitudes
- Generar contratos

### 3. Cobrador
- Ver pagos pendientes de validación
- Validar/rechazar pagos
- Gestionar rutas de cobranza
- Ver historial de pagos

### 4. Administrador
- Acceso completo al sistema
- Gestión de usuarios y personal
- Configuración de parámetros del sistema
- Reportes y estadísticas
- Gestión de backups
- Logs de auditoría
- Configuración de e-commerce

## 🔑 Credenciales por Defecto

Después de ejecutar el seed, puedes usar:

```
Administrador:
Email: admin@fredyfasbear.tech
Password: admin123

Evaluador:
Email: evaluador@fredyfasbear.tech
Password: evaluador123

Cobrador:
Email: cobrador@fredyfasbear.tech
Password: cobrador123

Cliente:
Email: cliente@fredyfasbear.tech
Password: cliente123
```

> ⚠️ **Importante**: Cambia estas contraseñas en producción.

## 📚 Scripts Disponibles

### Backend

```bash
npm run dev           # Modo desarrollo con nodemon
npm start             # Iniciar servidor en producción
npm run db:generate   # Generar cliente Prisma
npm run db:push       # Sincronizar schema sin migración
npm run db:migrate    # Crear y aplicar migración
npm run db:seed       # Poblar base de datos
npm run db:studio     # Abrir Prisma Studio
```

### Frontend

```bash
npm run dev           # Modo desarrollo
npm run build         # Build para producción
npm run preview       # Previsualizar build
npm run start         # Iniciar en producción
npm run generate      # Generar sitio estático
npm run lint          # Verificar código
npm run lint:fix      # Corregir errores de lint
```

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Bcrypt**: Hashing de contraseñas con salt
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso entre dominios
- **Validación de Datos**: Validación en backend y frontend
- **Sanitización**: Prevención de inyección SQL y XSS

## 🐛 Solución de Problemas

### El backend no inicia

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Ejecuta `npm run db:generate`

### Error de conexión a base de datos

```bash
# Verifica que PostgreSQL esté activo
systemctl status postgresql

# Reinicia PostgreSQL si es necesario
systemctl restart postgresql
```

### Problemas con migraciones

```bash
# Resetear base de datos (⚠️ elimina todos los datos)
npx prisma migrate reset

# Aplicar migraciones
npm run db:migrate
```

## 📄 Licencia

Este proyecto está bajo la licencia **Creative Commons Attribution-NonCommercial-NoDerivs 4.0 International (CC BY-NC-ND 4.0)**.

Esto significa que puedes:
- ✅ **Compartir**: Copiar y redistribuir el material en cualquier medio o formato

Bajo los siguientes términos:
- 📝 **Atribución (BY)**: Debes dar crédito apropiado
- 🚫 **No Comercial (NC)**: No puedes usar el material para fines comerciales
- 🔒 **Sin Obras Derivadas (ND)**: No puedes distribuir material modificado

Para más detalles, consulta el archivo [LICENSE](LICENSE) o visita: https://creativecommons.org/licenses/by-nc-nd/4.0/

## 👨‍💻 Autores

**Fredy Fasbear Industries**

Contacto: info@fredyfasbear.tech

---

<div align="center">

**Desarrollado con ❤️ por Fredy Fasbear Industries**

</div>
