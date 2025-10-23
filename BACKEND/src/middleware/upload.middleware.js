// BACKEND/src/middleware/upload.middleware.js
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs/promises';

/**
 * Middleware de configuración para manejo de archivos
 * Configurado específicamente para subir documentos DPI y fotos de artículos
 */
export const uploadMiddleware = fileUpload({
  // Crear directorio temporal si no existe
  useTempFiles: true,
  tempFileDir: './temp/uploads/',
  
  // Configuración de límites
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 5 // Máximo 5 archivos por request
  },
  
  // Configuración avanzada
  uploadTimeout: 60000, // 60 segundos timeout
  createParentPath: true, // Crear directorios padre automáticamente
  safeFileNames: true, // Nombres de archivo seguros
  preserveExtension: true, // Preservar extensión original
  
  // Configuración de debugging
  debug: process.env.NODE_ENV === 'development',
  
  // Configuración de parseo
  parseNested: true, // Parsear objetos anidados
  
  // Función de validación personalizada
  limitHandler: (req, res, next) => {
    console.log('Límite de archivo excedido');
    return res.status(413).json({
      success: false,
      message: 'Archivo muy grande. El tamaño máximo permitido es 10MB.',
      codigo: 'ARCHIVO_MUY_GRANDE'
    });
  },
  
  // Manejo de errores de timeout
  abortOnLimit: true
});

/**
 * Middleware personalizado para validación de archivos de imagen
 */
export const validateImageFiles = (req, res, next) => {
  console.log('🖼 Validando archivos de imagen...');
  
  try {
    if (!req.files) {
      console.log('No se encontraron archivos para validar');
      return next();
    }

    // Tipos MIME permitidos para imágenes
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    // Extensiones permitidas
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    // Función para validar un archivo individual
    const validateSingleFile = (file, fieldName) => {
      console.log(` Validando archivo ${fieldName}:`, { name: file.name, mimetype: file.mimetype, size: file.size });

      // Validar tipo MIME
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new Error(`Archivo ${fieldName}: Tipo no permitido ${file.mimetype}. Solo se permiten: JPG, PNG, WebP`);
      }

      // Validar extensión
      const extension = path.extname(file.name).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        throw new Error(`Archivo ${fieldName}: Extensión no permitida ${extension}. Solo se permiten: .jpg, .jpeg, .png, .webp`);
      }

      // Validar tamaño (10MB máximo)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`Archivo ${fieldName}: Muy grande (${file.size} bytes). Máximo permitido: 10MB`);
      }

      // Validar que el archivo tenga contenido
      if (file.size === 0) {
        throw new Error(`Archivo ${fieldName}: Archivo vacío`);
      }

      // Validar nombre de archivo
      if (!file.name || file.name.trim() === '') {
        throw new Error(`Archivo ${fieldName}: Nombre de archivo inválido`);
      }

      console.log(` Archivo ${fieldName} validado correctamente`);
      return true;
    };

    // Validar cada archivo recibido
    Object.keys(req.files).forEach(fieldName => {
      const file = req.files[fieldName];
      
      // Si es un array de archivos
      if (Array.isArray(file)) {
        file.forEach((f, index) => {
          validateSingleFile(f, `${fieldName}[${index}]`);
        });
      } else {
        // Archivo individual
        validateSingleFile(file, fieldName);
      }
    });

    console.log(' Todos los archivos validados correctamente');
    next();

  } catch (error) {
    console.error(' Error validando archivos:', error.message);
    
    return res.status(400).json({
      success: false,
      message: error.message,
      codigo: 'VALIDACION_ARCHIVO_FALLIDA'
    });
  }
};

/**
 * Middleware para validar específicamente archivos DPI
 */
export const validateDPIFiles = (req, res, next) => {
  console.log('🆔 Validando archivos DPI...');
  
  try {
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren archivos DPI',
        codigo: 'ARCHIVOS_DPI_REQUERIDOS'
      });
    }

    const { dpiFrontal, dpiTrasero } = req.files;

    // Validar que al menos uno esté presente
    if (!dpiFrontal && !dpiTrasero) {
      return res.status(400).json({
        success: false,
        message: 'Debe subir al menos una foto del DPI (frontal o trasero)',
        codigo: 'DPI_INCOMPLETO'
      });
    }

    // Validar archivos específicos
    if (dpiFrontal) {
      console.log(' Validando DPI Frontal...');
      
      // Validaciones adicionales específicas para DPI frontal
      if (dpiFrontal.size < 50 * 1024) { // Mínimo 50KB
        return res.status(400).json({
          success: false,
          message: 'DPI Frontal: Archivo muy pequeño, posiblemente corrupto',
          codigo: 'DPI_FRONTAL_MUY_PEQUENO'
        });
      }
    }

    if (dpiTrasero) {
      console.log(' Validando DPI Trasero...');
      
      // Validaciones adicionales específicas para DPI trasero
      if (dpiTrasero.size < 50 * 1024) { // Mínimo 50KB
        return res.status(400).json({
          success: false,
          message: 'DPI Trasero: Archivo muy pequeño, posiblemente corrupto',
          codigo: 'DPI_TRASERO_MUY_PEQUENO'
        });
      }
    }

    console.log(' Archivos DPI validados correctamente');
    next();

  } catch (error) {
    console.error(' Error validando archivos DPI:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno validando archivos DPI',
      codigo: 'ERROR_VALIDACION_DPI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware para limpiar archivos temporales en caso de error
 */
export const cleanupTempFiles = (req, res, next) => {
  // Hook para limpiar archivos temporales al finalizar la respuesta
  const originalSend = res.send;
  
  res.send = function(data) {
    // Llamar al método original primero
    originalSend.call(this, data);
    
    // Luego limpiar archivos temporales
    if (req.files) {
      console.log('🧹 Limpiando archivos temporales...');
      
      const cleanupFile = async (file) => {
        try {
          if (file.tempFilePath && await fs.access(file.tempFilePath).then(() => true).catch(() => false)) {
            await fs.unlink(file.tempFilePath);
            console.log(' Archivo temporal eliminado:', file.tempFilePath);
          }
        } catch (err) {
          console.log(' Warning: No se pudo eliminar archivo temporal:', file.tempFilePath);
        }
      };

      // Limpiar todos los archivos
      Object.values(req.files).forEach(file => {
        if (Array.isArray(file)) {
          file.forEach(cleanupFile);
        } else {
          cleanupFile(file);
        }
      });
    }
  };
  
  next();
};

/**
 * Middleware para crear directorios necesarios
 */
export const ensureUploadDirectories = async (req, res, next) => {
  try {
    console.log('Verificando directorios de upload...');
    
    const directories = [
      './temp/uploads',
      './uploads/clientes/dpi',
      './uploads/solicitudes/fotos',
      './uploads/solicitudes/documentos'
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(` Directorio verificado/creado: ${dir}`);
      } catch (err) {
        console.log(` Warning: Error creando directorio ${dir}:`, err.message);
      }
    }

    console.log(' Directorios de upload verificados');
    next();

  } catch (error) {
    console.error(' Error configurando directorios:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error configurando sistema de archivos',
      codigo: 'ERROR_FILESYSTEM_SETUP'
    });
  }
};

/**
 * Middleware combinado para manejo completo de uploads
 */
export const fullUploadMiddleware = [
  ensureUploadDirectories,
  uploadMiddleware,
  validateImageFiles,
  cleanupTempFiles
];

/**
 * Middleware específico para DPI con todas las validaciones
 */
export const dpiUploadMiddleware = [
  ensureUploadDirectories,
  uploadMiddleware,
  validateDPIFiles,
  validateImageFiles,
  cleanupTempFiles
];

/**
 * Función utilitaria para obtener información de un archivo
 */
export const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    originalName: file.name,
    mimetype: file.mimetype,
    size: file.size,
    extension: path.extname(file.name).toLowerCase(),
    isImage: file.mimetype.startsWith('image/'),
    tempPath: file.tempFilePath || null
  };
};

/**
 * Función utilitaria para generar nombre único de archivo
 */
export const generateUniqueFileName = (originalName, prefix = '', userId = null) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName).toLowerCase();
  const basename = path.basename(originalName, extension);
  
  // Limpiar el nombre base
  const cleanBasename = basename
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  let fileName = '';
  
  if (prefix) {
    fileName += `${prefix}-`;
  }
  
  if (userId) {
    fileName += `${userId}-`;
  }
  
  fileName += `${cleanBasename}-${timestamp}-${random}${extension}`;
  
  return fileName;
};

/**
 * Función utilitaria para validar y mover archivo
 */
export const moveFile = async (file, targetPath, overwrite = false) => {
  try {
    console.log(` Moviendo archivo de ${file.tempFilePath} a ${targetPath}`);
    
    // Verificar que el archivo temporal existe
    await fs.access(file.tempFilePath);
    
    // Crear directorio destino si no existe
    const targetDir = path.dirname(targetPath);
    await fs.mkdir(targetDir, { recursive: true });
    
    // Verificar si el archivo destino ya existe
    if (!overwrite) {
      try {
        await fs.access(targetPath);
        throw new Error(`El archivo ${targetPath} ya existe`);
      } catch (err) {
        // El archivo no existe, podemos continuar
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
    
    // Mover el archivo
    await file.mv(targetPath);
    
    // Verificar que se movió correctamente
    const stats = await fs.stat(targetPath);
    
    console.log(` Archivo movido exitosamente. Tamaño: ${stats.size} bytes`);
    
    return {
      success: true,
      path: targetPath,
      size: stats.size
    };
    
  } catch (error) {
    console.error(` Error moviendo archivo: ${error.message}`);
    throw error;
  }
};

export default {
  uploadMiddleware,
  validateImageFiles,
  validateDPIFiles,
  cleanupTempFiles,
  ensureUploadDirectories,
  fullUploadMiddleware,
  dpiUploadMiddleware,
  getFileInfo,
  generateUniqueFileName,
  moveFile
};