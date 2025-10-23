// Archivo: BACKEND/src/services/upload.service.js
// Servicio COMPLETO para manejo de subida y gestión de archivos

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UploadService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    this.ensureDirectories();
  }

  // Asegurar que los directorios existen
  async ensureDirectories() {
    try {
      const directories = [
        `${this.uploadPath}/solicitudes/fotos`,
        `${this.uploadPath}/solicitudes/documentos`,
        `${this.uploadPath}/prestamos/contratos`,
        `${this.uploadPath}/prestamos/recibos`,
        `${this.uploadPath}/usuarios/avatars`,
        `${this.uploadPath}/usuarios`,
        `${this.uploadPath}/temp`
      ];

      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
      }

      console.log('Directorios de upload verificados');
    } catch (error) {
      console.error(' Error creando directorios:', error);
    }
  }

  // Generar nombre único para archivo
  generateUniqueFilename(originalName, prefix = '') {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension).substring(0, 20); // Limitar longitud
    
    return `${prefix}${baseName}_${timestamp}_${randomSuffix}${extension}`;
  }

  // Validar archivo
  validateFile(file, type = 'image') {
    const errors = [];

    if (!file) {
      errors.push('No se proporcionó archivo');
      return { isValid: false, errors };
    }

    // Validar tamaño
    if (file.size > this.maxFileSize) {
      errors.push(`Archivo muy grande. Máximo ${Math.round(this.maxFileSize / 1024 / 1024)}MB`);
    }

    // Validar tipo MIME
    if (type === 'image' && !this.allowedImageTypes.includes(file.mimetype)) {
      errors.push('Tipo de imagen no permitido. Use JPG, PNG o WebP');
    }

    if (type === 'document' && !this.allowedDocTypes.includes(file.mimetype)) {
      errors.push('Tipo de documento no permitido. Use PDF o Word');
    }

    // Validar nombre
    if (!file.name || file.name.length > 255) {
      errors.push('Nombre de archivo no válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Guardar foto de solicitud
  async guardarFoto(archivo, carpeta = 'solicitudes') {
    try {
      const validation = this.validateFile(archivo, 'image');
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const filename = this.generateUniqueFilename(archivo.name, 'foto_');
      const dirPath = path.join(this.uploadPath, carpeta, 'fotos');
      const filePath = path.join(dirPath, filename);

      // Asegurar que el directorio existe
      await fs.mkdir(dirPath, { recursive: true });

      // Mover archivo
      await archivo.mv(filePath);

      const relativePath = `/uploads/${carpeta}/fotos/${filename}`;
      
      console.log(`📸 Foto guardada: ${relativePath}`);
      
      return relativePath;

    } catch (error) {
      console.error('Error guardando foto:', error);
      throw new Error(`Error guardando foto: ${error.message}`);
    }
  }

  // Guardar documento
  async guardarDocumento(archivo, carpeta = 'solicitudes/documentos') {
    try {
      const validation = this.validateFile(archivo, 'document');
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const filename = this.generateUniqueFilename(archivo.name, 'doc_');
      const dirPath = path.join(this.uploadPath, carpeta);
      const filePath = path.join(dirPath, filename);

      // Asegurar que el directorio existe
      await fs.mkdir(dirPath, { recursive: true });

      // Mover archivo
      await archivo.mv(filePath);

      const relativePath = `/uploads/${carpeta}/${filename}`;
      
      console.log(` Documento guardado: ${relativePath}`);
      
      return relativePath;

    } catch (error) {
      console.error('Error guardando documento:', error);
      throw new Error(`Error guardando documento: ${error.message}`);
    }
  }

  // Guardar avatar de usuario
  async guardarAvatar(archivo, usuarioId) {
    try {
      const validation = this.validateFile(archivo, 'image');
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const extension = path.extname(archivo.name);
      const filename = `avatar_${usuarioId}_${Date.now()}${extension}`;
      const dirPath = path.join(this.uploadPath, 'usuarios', 'avatars');
      const filePath = path.join(dirPath, filename);

      // Eliminar avatar anterior si existe
      await this.eliminarAvatarAnterior(usuarioId);

      // Asegurar que el directorio existe
      await fs.mkdir(dirPath, { recursive: true });

      // Mover archivo
      await archivo.mv(filePath);

      const relativePath = `/uploads/usuarios/avatars/${filename}`;
      
      console.log(` Avatar guardado: ${relativePath}`);
      
      return relativePath;

    } catch (error) {
      console.error('Error guardando avatar:', error);
      throw new Error(`Error guardando avatar: ${error.message}`);
    }
  }

  // Eliminar avatar anterior
  async eliminarAvatarAnterior(usuarioId) {
    try {
      const avatarDir = path.join(this.uploadPath, 'usuarios', 'avatars');
      
      // Buscar archivos que coincidan con el patrón
      const files = await fs.readdir(avatarDir).catch(() => []);
      const avatarFiles = files.filter(file => file.startsWith(`avatar_${usuarioId}_`));
      
      // Eliminar archivos encontrados
      for (const file of avatarFiles) {
        const filePath = path.join(avatarDir, file);
        await fs.unlink(filePath).catch(console.error);
        console.log(` Avatar anterior eliminado: ${file}`);
      }
      
    } catch (error) {
      console.error('Error eliminando avatar anterior:', error);
      // No lanzar error, es operación opcional
    }
  }

  // Eliminar archivo por ruta
  async eliminarArchivo(rutaRelativa) {
    try {
      if (!rutaRelativa) {
        throw new Error('Ruta de archivo no proporcionada');
      }

      // Construir ruta completa
      // Si la ruta empieza con /uploads, removerlo para evitar duplicación
      const rutaLimpia = rutaRelativa.startsWith('/uploads') 
        ? rutaRelativa.substring(8) 
        : rutaRelativa;
      
      const rutaCompleta = path.join(this.uploadPath, rutaLimpia);

      // Verificar que el archivo existe
      try {
        await fs.access(rutaCompleta);
      } catch (error) {
        console.warn(` Archivo no existe: ${rutaCompleta}`);
        return true; // No es un error crítico si el archivo ya no existe
      }

      // Verificar que el archivo está dentro del directorio de uploads
      // (Prevención de path traversal)
      const rutaAbsoluta = path.resolve(rutaCompleta);
      const uploadAbsoluto = path.resolve(this.uploadPath);
      
      if (!rutaAbsoluta.startsWith(uploadAbsoluto)) {
        throw new Error('Intento de acceso a archivo fuera del directorio permitido');
      }

      // Eliminar el archivo
      await fs.unlink(rutaCompleta);
      console.log(` Archivo eliminado: ${rutaRelativa}`);
      
      return true;

    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw new Error(`Error eliminando archivo: ${error.message}`);
    }
  }

  // Eliminar múltiples archivos
  async eliminarMultiplesArchivos(rutasRelativas) {
    if (!Array.isArray(rutasRelativas) || rutasRelativas.length === 0) {
      return { exitosos: 0, fallidos: 0 };
    }

    let exitosos = 0;
    let fallidos = 0;

    for (const ruta of rutasRelativas) {
      try {
        await this.eliminarArchivo(ruta);
        exitosos++;
      } catch (error) {
        console.error(`Error eliminando archivo ${ruta}:`, error);
        fallidos++;
      }
    }

    console.log(` Archivos eliminados: ${exitosos} exitosos, ${fallidos} fallidos`);
    
    return { exitosos, fallidos };
  }

  // Mover un archivo de una ubicación a otra
  async moverArchivo(rutaOrigen, rutaDestino) {
    try {
      const rutaOrigenCompleta = path.join(this.uploadPath, rutaOrigen);
      const rutaDestinoCompleta = path.join(this.uploadPath, rutaDestino);

      // Asegurar que el directorio destino existe
      const directorioDestino = path.dirname(rutaDestinoCompleta);
      await fs.mkdir(directorioDestino, { recursive: true });

      // Mover el archivo
      await fs.rename(rutaOrigenCompleta, rutaDestinoCompleta);
      
      console.log(` Archivo movido: ${rutaOrigen} → ${rutaDestino}`);
      
      return rutaDestino;

    } catch (error) {
      console.error('Error moviendo archivo:', error);
      throw new Error(`Error moviendo archivo: ${error.message}`);
    }
  }

  // Copiar un archivo
  async copiarArchivo(rutaOrigen, rutaDestino) {
    try {
      const rutaOrigenCompleta = path.join(this.uploadPath, rutaOrigen);
      const rutaDestinoCompleta = path.join(this.uploadPath, rutaDestino);

      // Asegurar que el directorio destino existe
      const directorioDestino = path.dirname(rutaDestinoCompleta);
      await fs.mkdir(directorioDestino, { recursive: true });

      // Copiar el archivo
      await fs.copyFile(rutaOrigenCompleta, rutaDestinoCompleta);
      
      console.log(` Archivo copiado: ${rutaOrigen} → ${rutaDestino}`);
      
      return rutaDestino;

    } catch (error) {
      console.error('Error copiando archivo:', error);
      throw new Error(`Error copiando archivo: ${error.message}`);
    }
  }

  // Obtener información de archivo
  async obtenerInfoArchivo(rutaRelativa) {
    try {
      const rutaCompleta = path.join(process.cwd(), rutaRelativa);
      const stats = await fs.stat(rutaCompleta);
      
      return {
        existe: true,
        tamaño: stats.size,
        fechaCreacion: stats.birthtime,
        fechaModificacion: stats.mtime,
        esArchivo: stats.isFile(),
        esDirectorio: stats.isDirectory(),
        rutaCompleta
      };

    } catch (error) {
      return {
        existe: false,
        error: error.message
      };
    }
  }

  // Limpiar archivos temporales
  async limpiarTemporales(diasAntiguedad = 1) {
    try {
      const tempDir = path.join(this.uploadPath, 'temp');
      const files = await fs.readdir(tempDir).catch(() => []);
      
      const ahora = Date.now();
      const limiteTiempo = diasAntiguedad * 24 * 60 * 60 * 1000; // días a milisegundos
      
      let archivosEliminados = 0;

      for (const file of files) {
        try {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          
          if (ahora - stats.mtime.getTime() > limiteTiempo) {
            await fs.unlink(filePath);
            archivosEliminados++;
            console.log(`🧹 Archivo temporal eliminado: ${file}`);
          }
        } catch (error) {
          console.error(`Error procesando archivo temporal ${file}:`, error);
        }
      }

      console.log(`🧹 Limpieza completada: ${archivosEliminados} archivos eliminados`);
      return archivosEliminados;

    } catch (error) {
      console.error('Error limpiando archivos temporales:', error);
      return 0;
    }
  }

  // Obtener estadísticas de almacenamiento
  async obtenerEstadisticas() {
    try {
      const estadisticas = {
        directorios: {},
        totalArchivos: 0,
        tamañoTotal: 0
      };

      const directorios = [
        'solicitudes/fotos',
        'solicitudes/documentos', 
        'prestamos/contratos',
        'prestamos/recibos',
        'usuarios/avatars',
        'usuarios',
        'temp'
      ];

      for (const dir of directorios) {
        const dirPath = path.join(this.uploadPath, dir);
        try {
          const files = await fs.readdir(dirPath);
          let tamaño = 0;
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
              tamaño += stats.size;
            }
          }
          
          estadisticas.directorios[dir] = {
            archivos: files.length,
            tamaño,
            tamañoFormateado: this.formatearTamaño(tamaño)
          };
          
          estadisticas.totalArchivos += files.length;
          estadisticas.tamañoTotal += tamaño;
          
        } catch (error) {
          estadisticas.directorios[dir] = {
            archivos: 0,
            tamaño: 0,
            error: error.message
          };
        }
      }

      estadisticas.tamañoTotalFormateado = this.formatearTamaño(estadisticas.tamañoTotal);
      
      return estadisticas;

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Formatear tamaño de archivo
  formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validar espacio disponible en disco
  async validarEspacioDisponible(tamañoRequerido) {
    try {
      // Implementación básica - en producción podrías usar librerías como 'statvfs'
      const stats = await fs.stat(this.uploadPath);
      
      // Por ahora asumimos que hay espacio si el directorio existe
      // En producción, implementarías verificación real del espacio en disco
      return tamañoRequerido < 100 * 1024 * 1024; // 100MB como límite ejemplo
      
    } catch (error) {
      console.error('Error validando espacio:', error);
      return false;
    }
  }

  // Crear backup de archivos importantes
  async crearBackup(rutasArchivos, nombreBackup) {
    try {
      const backupDir = path.join(this.uploadPath, 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${nombreBackup}_${timestamp}`);
      await fs.mkdir(backupPath, { recursive: true });
      
      for (const rutaArchivo of rutasArchivos) {
        try {
          const rutaCompleta = path.join(process.cwd(), rutaArchivo);
          const nombreArchivo = path.basename(rutaArchivo);
          const rutaDestino = path.join(backupPath, nombreArchivo);
          
          await fs.copyFile(rutaCompleta, rutaDestino);
        } catch (error) {
          console.error(`Error copiando archivo ${rutaArchivo}:`, error);
        }
      }
      
      console.log(` Backup creado: ${backupPath}`);
      return backupPath;
      
    } catch (error) {
      console.error('Error creando backup:', error);
      throw error;
    }
  }
}

// Instancia singleton
const uploadService = new UploadService();

export default uploadService;