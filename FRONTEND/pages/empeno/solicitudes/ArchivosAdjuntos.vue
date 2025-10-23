
<template>
  <div class="archivos-adjuntos">
    <!-- Header del componente -->
    <div class="archivos-header">
      <div class="header-left">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05L12.25 20.24C11.84 20.65 11.84 21.28 12.25 21.69C12.66 22.1 13.29 22.1 13.7 21.69L22.89 12.5C24.46 10.93 24.46 8.37 22.89 6.8C21.32 5.23 18.76 5.23 17.19 6.8L7.71 16.28C6.53 17.46 6.53 19.34 7.71 20.52C8.89 21.7 10.77 21.7 11.95 20.52L20.83 11.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Archivos Adjuntos
        </h3>
        <span v-if="archivos.length" class="contador-archivos">
          {{ archivos.length }} {{ archivos.length === 1 ? 'archivo' : 'archivos' }}
        </span>
      </div>
      
      <button 
        v-if="archivos.length > 0" 
        @click="toggleModoVisualizacion"
        class="btn-modo-vista"
        :title="modoVista === 'grid' ? 'Cambiar a lista' : 'Cambiar a galería'"
      >
        <svg v-if="modoVista === 'grid'" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
          <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2"/>
          <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Estado vacío -->
    <div v-if="loading" class="estado-carga">
      <div class="spinner"></div>
      <p>Cargando archivos...</p>
    </div>

    <div v-else-if="!archivos.length" class="estado-vacio">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" stroke-width="2"/>
        <polyline points="14,2 14,8 20,8" stroke="#9CA3AF" stroke-width="2"/>
      </svg>
      <h4>No hay archivos adjuntos</h4>
      <p>Esta solicitud no tiene documentos o fotos adjuntas.</p>
    </div>

    <!-- Filtros -->
    <div v-else class="filtros-archivos">
      <div class="filtro-tipo">
        <button 
          v-for="filtro in filtrosDisponibles" 
          :key="filtro.tipo"
          @click="filtroActivo = filtro.tipo"
          :class="['btn-filtro', { active: filtroActivo === filtro.tipo }]"
        >
          <component :is="filtro.icono" />
          {{ filtro.label }}
          <span class="contador">({{ filtro.cantidad }})</span>
        </button>
      </div>
    </div>

    <!-- Lista de archivos -->
    <div v-if="archivosFiltrados.length" :class="['archivos-contenido', modoVista]">
      
      <!-- Vista en Grid (Galería) -->
      <div v-if="modoVista === 'grid'" class="archivos-grid">
        <div 
          v-for="archivo in archivosFiltrados" 
          :key="archivo.id"
          class="archivo-card"
          @click="abrirArchivo(archivo)"
        >
          <!-- Previsualización -->
          <div class="archivo-preview">
            <img 
              v-if="esImagen(archivo)"
              :src="getUrlArchivo(archivo)"
              :alt="archivo.nombreArchivo"
              class="preview-imagen"
              @error="onImageError"
            >
            <div v-else class="preview-documento">
              <component :is="getIconoTipo(archivo.tipoDocumento)" class="icono-tipo" />
              <span class="extension">{{ getExtension(archivo.nombreArchivo) }}</span>
            </div>
          </div>

          <!-- Info del archivo -->
          <div class="archivo-info">
            <h4 class="archivo-nombre" :title="archivo.nombreArchivo">
              {{ archivo.nombreArchivo }}
            </h4>
            <p class="archivo-detalles">
              <span class="tipo">{{ formatTipoDocumento(archivo.tipoDocumento) }}</span>
              <span class="separador">•</span>
              <span class="tamaño">{{ formatFileSize(archivo.tamanoArchivo) }}</span>
            </p>
          </div>

          <!-- Overlay de acciones -->
          <div class="archivo-overlay">
            <button 
              @click.stop="descargarArchivo(archivo)"
              class="btn-accion"
              title="Descargar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button 
              v-if="esImagen(archivo)"
              @click.stop="verImagenCompleta(archivo)"
              class="btn-accion"
              title="Ver imagen completa"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Vista en Lista -->
      <div v-else class="archivos-lista">
        <div 
          v-for="archivo in archivosFiltrados" 
          :key="archivo.id"
          class="archivo-item"
        >
          <div class="item-icono">
            <component :is="getIconoTipo(archivo.tipoDocumento)" />
          </div>
          
          <div class="item-info">
            <h4 class="item-nombre">{{ archivo.nombreArchivo }}</h4>
            <p class="item-detalles">
              {{ formatTipoDocumento(archivo.tipoDocumento) }} • 
              {{ formatFileSize(archivo.tamanoArchivo) }} •
              {{ formatDate(archivo.fechaSubida) }}
            </p>
          </div>

          <div class="item-acciones">
            <button 
              @click="abrirArchivo(archivo)"
              class="btn-accion-secundario"
              title="Abrir"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button 
              @click="descargarArchivo(archivo)"
              class="btn-accion-secundario"
              title="Descargar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de imagen -->
    <div v-if="imagenModalOpen" class="modal-imagen" @click="cerrarModalImagen">
      <div class="modal-contenido" @click.stop>
        <button @click="cerrarModalImagen" class="btn-cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <img :src="imagenModalSrc" :alt="imagenModalAlt" class="imagen-modal">
        <div class="modal-info">
          <h3>{{ imagenModalAlt }}</h3>
          <p>{{ formatTipoDocumento(imagenModalTipo) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ===== PROPS =====
const props = defineProps({
  archivos: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// ===== COMPOSABLES =====
const config = useRuntimeConfig()
const route = useRoute()

// ===== ESTADO REACTIVO =====
const modoVista = ref('grid'); // 'grid' o 'list'
const filtroActivo = ref('todos');
const imagenModalOpen = ref(false);
const imagenModalSrc = ref('');
const imagenModalAlt = ref('');
const imagenModalTipo = ref('');

// ===== COMPUTED =====
const solicitudId = computed(() => {
  return parseInt(route.params.id)
})

const filtrosDisponibles = computed(() => {
  const filtros = [
    { tipo: 'todos', label: 'Todos', cantidad: props.archivos.length, icono: IconoTodos }
  ];

  // Contar tipos de documentos
  const tipos = {};
  props.archivos.forEach(archivo => {
    tipos[archivo.tipoDocumento] = (tipos[archivo.tipoDocumento] || 0) + 1;
  });

  // Agregar filtros específicos
  if (tipos['Foto_Prenda']) {
    filtros.push({
      tipo: 'Foto_Prenda',
      label: 'Fotos',
      cantidad: tipos['Foto_Prenda'],
      icono: IconoFoto
    });
  }

  if (tipos['Especificaciones']) {
    filtros.push({
      tipo: 'Especificaciones',
      label: 'Documentos',
      cantidad: tipos['Especificaciones'],
      icono: IconoDocumento
    });
  }

  return filtros;
});

const archivosFiltrados = computed(() => {
  if (filtroActivo.value === 'todos') {
    return props.archivos;
  }
  return props.archivos.filter(archivo => archivo.tipoDocumento === filtroActivo.value);
});

// ===== MÉTODOS PRINCIPALES =====
const toggleModoVisualizacion = () => {
  modoVista.value = modoVista.value === 'grid' ? 'list' : 'grid';
};

const esImagen = (archivo) => {
  const tiposImagen = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return tiposImagen.includes(archivo.tipoMime) || archivo.tipoDocumento === 'Foto_Prenda';
};

// ===== FUNCIÓN PARA CONSTRUIR URLs =====
const getUrlArchivo = (archivo) => {
  if (!archivo || !archivo.rutaArchivo) {
    // Retornar un SVG placeholder inline en lugar de una ruta que no existe
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNODAgODBDODUuNTIyOCA4MCA5MCA4NC40NzcyIDkwIDkwQzkwIDk1LjUyMjggODUuNTIyOCAxMDAgODAgMTAwQzc0LjQ3NzIgMTAwIDcwIDk1LjUyMjggNzAgOTBDNzAgODQuNDc3MiA3NC40NzcyIDgwIDgwIDgwWiIgZmlsbD0iI0FBQUFBQSIvPgo8L3N2Zz4K';
  }

  let rutaArchivo = archivo.rutaArchivo;
  
  // Si ya es una URL completa, devolverla tal como está
  if (rutaArchivo.startsWith('http')) {
    return rutaArchivo;
  }
  
  // Construir URL correctamente
  const baseUrl = config.public.apiBase || config.public.apiBaseUrl || '';
  
  // Si la ruta ya incluye /uploads, no duplicarla
  if (rutaArchivo.startsWith('/uploads')) {
    return `${baseUrl.replace('/api', '')}${rutaArchivo}`;
  }
  
  // Si no incluye /uploads, agregarla
  return `${baseUrl.replace('/api', '')}/uploads/${rutaArchivo}`;
};

const getUrlDescarga = (archivo) => {
  if (!archivo || !solicitudId.value) {
    return '#';
  }
  
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  
  if (!apiBase) {
    console.error('NUXT_PUBLIC_API_BASE no está configurado');
    return '#';
  }
  
  return `${apiBase}/solicitudes/${solicitudId.value}/archivo/${archivo.id}`;
};

const getExtension = (nombreArchivo) => {
  if (!nombreArchivo) return '';
  return nombreArchivo.split('.').pop()?.toUpperCase() || '';
};

const formatTipoDocumento = (tipo) => {
  const tipos = {
    'Foto_Prenda': 'Foto del Artículo',
    'Especificaciones': 'Documento Técnico'
  };
  return tipos[tipo] || tipo;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// ===== MANEJADORES DE EVENTOS =====
const abrirArchivo = (archivo) => {
  if (esImagen(archivo)) {
    verImagenCompleta(archivo);
  } else {
    descargarArchivo(archivo);
  }
};

const verImagenCompleta = (archivo) => {
  imagenModalSrc.value = getUrlArchivo(archivo);
  imagenModalAlt.value = archivo.nombreArchivo;
  imagenModalTipo.value = archivo.tipoDocumento;
  imagenModalOpen.value = true;
};

const cerrarModalImagen = () => {
  imagenModalOpen.value = false;
  imagenModalSrc.value = '';
  imagenModalAlt.value = '';
  imagenModalTipo.value = '';
};

const descargarArchivo = async (archivo) => {
  try {
    // Obtener token de múltiples fuentes posibles
    let token = null;
    
    // Método 1: Desde localStorage
    token = localStorage.getItem('auth-token');
    
    // Método 2: Desde sessionStorage si no está en localStorage
    if (!token) {
      token = sessionStorage.getItem('auth-token');
    }
    
    // Método 3: Desde cookies si existe
    if (!token) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    
    // Método 4: Desde el composable useAuth si está disponible
    if (!token) {
      try {
        const { getToken } = useAuth();
        token = getToken?.();
      } catch (e) {
        // Ignorar si useAuth no está disponible
      }
    }
    
    if (!token) {
      console.error('No se encontró token de autenticación');
      alert('Error: No se pudo autenticar la descarga. Por favor, inicia sesión nuevamente.');
      return;
    }

    console.log('Token encontrado para descarga:', token.substring(0, 20) + '...');

    const url = getUrlDescarga(archivo);
    console.log('URL de descarga:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = archivo.nombreArchivo;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Limpiar después de un breve delay
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }, 100);
    
    console.log('Descarga iniciada exitosamente');
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
    alert(`Error al descargar el archivo: ${error.message}`);
  }
};

const onImageError = (event) => {
  // Usar una imagen placeholder que existe o un SVG inline
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNODAgODBDODUuNTIyOCA4MCA5MCA4NC40NzcyIDkwIDkwQzkwIDk1LjUyMjggODUuNTIyOCAxMDAgODAgMTAwQzc0LjQ3NzIgMTAwIDcwIDk1LjUyMjggNzAgOTBDNzAgODQuNDc3MiA3NC40NzcyIDgwIDgwIDgwWiIgZmlsbD0iI0FBQUFBQSIvPgo8cGF0aCBkPSJNMTIwIDEyMEwxMDAgMTAwTDkwIDExMEw4MCA5MEw3MCA5MEw2MCA5MEw2MCA5MEM2MCA5MCA2MCA5MCA2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MEw2MCA5MCIgZmlsbD0iI0FBQUFBQSIvPgo8L3N2Zz4K';
};

// ===== FUNCIONES DE ICONOS =====
const getIconoTipo = (tipoDocumento) => {
  if (tipoDocumento === 'Foto_Prenda') {
    return IconoFoto;
  } else if (tipoDocumento === 'Especificaciones') {
    return IconoDocumento;
  }
  return IconoArchivo;
};

// ===== COMPONENTES DE ICONOS =====
const IconoFoto = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
      <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
};

const IconoDocumento = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
};

const IconoArchivo = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21.44 11.05L12.25 20.24C11.84 20.65 11.84 21.28 12.25 21.69C12.66 22.1 13.29 22.1 13.7 21.69L22.89 12.5C24.46 10.93 24.46 8.37 22.89 6.8C21.32 5.23 18.76 5.23 17.19 6.8L7.71 16.28C6.53 17.46 6.53 19.34 7.71 20.52C8.89 21.7 10.77 21.7 11.95 20.52L20.83 11.64" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
};

const IconoTodos = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
};
</script>

<style scoped>
/* ===== VARIABLES CSS ===== */
:root {
  --color-dorado-vintage: #D4AF37;
  --color-negro-carbon: #1a1a1a;
  --color-gris-acero: #6c757d;
  --color-blanco-perla: #f8f9fa;
}

/* ===== CONTENEDOR PRINCIPAL ===== */
.archivos-adjuntos {
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* ===== HEADER ===== */
.archivos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--color-negro-carbon), #2c3e50);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.archivos-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.contador-archivos {
  background: rgba(212, 175, 55, 0.2);
  color: var(--color-dorado-vintage);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-modo-vista {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modo-vista:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--color-dorado-vintage);
}

/* ===== ESTADOS ===== */
.estado-carga, .estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--color-gris-acero);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.estado-vacio h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--color-negro-carbon);
}

/* ===== FILTROS ===== */
.filtros-archivos {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.filtro-tipo {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-filtro {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.btn-filtro:hover {
  border-color: var(--color-dorado-vintage);
  background: #fff9e6;
}

.btn-filtro.active {
  background: var(--color-dorado-vintage);
  border-color: var(--color-dorado-vintage);
  color: white;
}

.contador {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.btn-filtro.active .contador {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== VISTA GRID ===== */
.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.archivo-card {
  position: relative;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.archivo-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.archivo-preview {
  height: 150px;
  position: relative;
  overflow: hidden;
}

.preview-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-documento {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: var(--color-gris-acero);
}

.icono-tipo {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
}

.extension {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.archivo-info {
  padding: 1rem;
}

.archivo-nombre {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.archivo-detalles {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.separador {
  color: #dee2e6;
}

.archivo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.archivo-card:hover .archivo-overlay {
  opacity: 1;
}

.btn-accion {
  background: var(--color-dorado-vintage);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-accion:hover {
  background: #b8941f;
  transform: scale(1.1);
}

/* ===== VISTA LISTA ===== */
.archivos-lista {
  padding: 1rem 2rem 2rem 2rem;
}

.archivo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.archivo-item:hover {
  border-color: var(--color-dorado-vintage);
  background: #fff9e6;
}

.item-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  color: var(--color-gris-acero);
}

.item-info {
  flex: 1;
}

.item-nombre {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.item-detalles {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

.item-acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-accion-secundario {
  background: white;
  border: 1px solid #e9ecef;
  color: var(--color-gris-acero);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-accion-secundario:hover {
  border-color: var(--color-dorado-vintage);
  color: var(--color-dorado-vintage);
}

/* ===== MODAL DE IMAGEN ===== */
.modal-imagen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-contenido {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.btn-cerrar {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s ease;
}

.btn-cerrar:hover {
  background: rgba(0, 0, 0, 0.8);
}

.imagen-modal {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

.modal-info {
  padding: 1rem;
  background: white;
}

.modal-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: var(--color-negro-carbon);
}

.modal-info p {
  margin: 0;
  color: var(--color-gris-acero);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .archivos-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .archivos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
  }

  .archivos-lista {
    padding: 1rem;
  }

  .archivo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .item-acciones {
    align-self: stretch;
    justify-content: space-between;
  }

  .filtro-tipo {
    justify-content: center;
  }
}
</style>