import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import productosRoutes from './routes/productos.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { requestLogger } from './middleware/requestLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://0.0.0.0:3001'
  ];

  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  if (process.env.ALLOWED_ORIGINS) {
    const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    origins.push(...customOrigins);
  }

  return [...new Set(origins)];
};

const allowedOrigins = getAllowedOrigins();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }, 
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"], 
      connectSrc: ["'self'", ...allowedOrigins],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Origen bloqueado por CORS: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Disposition']
}));

app.use(compression());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(requestLogger);

app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  useTempFiles: true,
  tempFileDir: './tmp/',
  debug: process.env.NODE_ENV === 'development',
  abortOnLimit: true,
  responseOnLimit: 'El archivo es muy grande. Máximo 10MB permitido.',
  uploadTimeout: 120000,
  safeFileNames: true,
  preserveExtension: true,
  parseNested: true,
  uriDecodeFileNames: true
}));

app.use('/uploads', express.static(join(process.cwd(), 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      res.status(403).end('Tipo de archivo no permitido');
      return;
    }
    
    if (['.jpg', '.jpeg'].includes(ext)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.webp') {
      res.setHeader('Content-Type', 'image/webp');
    } else if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fredy Fasbear Prestamos API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api', routes);

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint de API no encontrado',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Verifica la documentación de la API en /api/info'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    available_endpoints: [
      '/ - Información básica',
      '/api/info - Información de la API',
      '/api/health - Estado del servicio',
      '/api/auth/* - Autenticación',
      '/api/prestamos/* - Gestión de préstamos',
      '/api/solicitudes/* - Gestión de solicitudes',
      '/api/cobrador/* - Gestión de cobranza'
    ]
  });
});

app.use(errorHandler);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const gracefulShutdown = (signal) => {
  console.log(`\nRecibida señal ${signal}. Cerrando servidor...`);
  
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n====================================');
  console.log(' FREDY FASBEAR PRESTAMOS API');
  console.log('====================================');
  console.log(`Servidor corriendo en todas las interfaces, en el puerto ${PORT}`);
  console.log(`Documentación: http://${HOST}:${PORT}/api/info`);
  console.log(`Estado: http://${HOST}:${PORT}/api/health`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
  console.log(`Iniciado: ${new Date().toLocaleString()}`);
  console.log('====================================');
  console.log(`Orígenes CORS permitidos: ${allowedOrigins.join(', ')}`);
  console.log('====================================\n');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('MODO DESARROLLO ACTIVO');
    console.log('- Logging detallado habilitado');
    console.log('- Hot reload con nodemon');
    console.log('- CORS permisivo configurado');
    console.log('- Upload debugging habilitado');
    console.log('- Archivos estáticos con CORS habilitado\n');
  }
});

server.timeout = 120000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

export default app;