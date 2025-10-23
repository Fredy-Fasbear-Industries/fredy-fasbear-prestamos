<template>
  <div class="contact-page">
    <!-- Header -->
    <header class="contact-header">
      <div class="header-container">
        <NuxtLink to="/" class="logo">
          <img src="~/assets/images/logo.png" alt="Fredy Fasbear Logo" />
          <h1>Fredy Fasbear</h1>
        </NuxtLink>
        <NuxtLink to="/" class="back-home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al inicio
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="contact-main">
      <div class="container">
        <div class="contact-content">
          
          <!-- Contact Info -->
          <div class="contact-info">
            <div class="info-header">
              <div class="icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h1>Contáctanos</h1>
              <p>Estamos aquí para ayudarte con cualquier consulta sobre nuestros servicios de préstamos pignoraticios.</p>
            </div>

            <div class="contact-methods">
              <div class="contact-method">
                <div class="method-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30511 3.09849 2.44735 2.85669 2.63482 2.65162C2.8223 2.44655 3.05023 2.28271 3.30421 2.17052C3.5582 2.05833 3.83276 2.00026 4.10999 2H7.10999C7.59544 1.99522 8.06544 2.16708 8.43999 2.48353C8.81454 2.79999 9.06902 3.23945 9.15999 3.72L9.69999 6.42C9.77766 6.81962 9.7473 7.23438 9.61227 7.61876C9.47724 8.00314 9.24282 8.34199 8.92999 8.6L7.73999 9.79C9.18393 12.3135 11.3865 14.5161 13.91 15.96L15.1 14.77C15.358 14.4572 15.6969 14.2228 16.0812 14.0877C16.4656 13.9527 16.8804 13.9223 17.28 14L19.98 14.54C20.4657 14.6307 20.9093 14.8886 21.2256 15.2679C21.542 15.6472 21.7121 16.1232 21.71 16.61V19.61" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="method-details">
                  <h3>Teléfono</h3>
                  <p>+502 1234-5678</p>
                </div>
              </div>

              <div class="contact-method">
                <div class="method-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="method-details">
                  <h3>Email</h3>
                  <p>contacto@freddyfasbear.com</p>
                </div>
              </div>

              <div class="contact-method">
                <div class="method-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="method-details">
                  <h3>Dirección</h3>
                  <p>Guatemala City, Guatemala</p>
                </div>
              </div>

              <div class="contact-method">
                <div class="method-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="method-details">
                  <h3>Horarios</h3>
                  <p>Lun - Vie: 8:00 AM - 6:00 PM<br>Sáb: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form-section">
            <form @submit.prevent="handleContactSubmit" class="contact-form">
              <h2>Envíanos un mensaje</h2>
              
              <!-- Alert messages -->
              <div v-if="message.text" :class="`alert alert-${message.type}`">
                <svg v-if="message.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ message.text }}
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="name">Nombre *</label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="contactForm.name" 
                    required 
                    :disabled="loading"
                  />
                </div>
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="contactForm.email" 
                    required 
                    :disabled="loading"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    v-model="contactForm.phone" 
                    :disabled="loading"
                  />
                </div>
                <div class="form-group">
                  <label for="subject">Asunto *</label>
                  <select id="subject" v-model="contactForm.subject" required :disabled="loading">
                    <option value="">Seleccionar asunto</option>
                    <option value="consulta">Consulta general</option>
                    <option value="prestamo">Información sobre préstamos</option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="message">Mensaje *</label>
                <textarea 
                  id="message" 
                  v-model="contactForm.message" 
                  rows="6" 
                  required 
                  :disabled="loading"
                  placeholder="Describe tu consulta o mensaje..."
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                <svg v-if="loading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 12C21 7.02944 16.9706 3 12 3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ loading ? 'Enviando...' : 'Enviar mensaje' }}
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
useHead({
  title: 'Contacto - Fredy Fasbear',
  meta: [
    { name: 'description', content: 'Contáctanos para cualquier consulta sobre nuestros servicios de préstamos pignoraticios' }
  ]
})

const { api } = useApi()

// Reactive state
const loading = ref(false)
const message = ref({ text: '', type: '' })

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// Computed
const isFormValid = computed(() => {
  return contactForm.value.name.trim() &&
         contactForm.value.email.trim() &&
         contactForm.value.subject &&
         contactForm.value.message.trim()
})

// Methods
const clearMessage = () => {
  message.value = { text: '', type: '' }
}

const handleContactSubmit = async () => {
  clearMessage()
  loading.value = true

  try {
    const response = await api('/homepage/contact', {
      method: 'POST',
      body: contactForm.value
    })

    if (response.success) {
      message.value = {
        text: 'Mensaje enviado exitosamente. Te responderemos pronto.',
        type: 'success'
      }
      // Reset form
      contactForm.value = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      }
    } else {
      throw new Error(response.message || 'Error enviando mensaje')
    }
  } catch (error) {
    message.value = {
      text: error.message || 'Error enviando el mensaje. Inténtalo de nuevo.',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

// Clear message after 5 seconds
watch(message, (newMessage) => {
  if (newMessage.text) {
    setTimeout(() => {
      if (message.value.text === newMessage.text) {
        clearMessage()
      }
    }, 5000)
  }
})
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.contact-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
}

.logo img {
  height: 40px;
  width: auto;
}

.logo h1 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #D4AF37;
  margin: 0;
}

.back-home {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-home:hover {
  color: #D4AF37;
}

.contact-main {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.contact-info {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.info-header {
  text-align: center;
  margin-bottom: 3rem;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.info-header h1 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.info-header p {
  color: #6c757d;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-method {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.method-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4AF37;
  flex-shrink: 0;
}

.method-details h3 {
  color: #2C3E50;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.method-details p {
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.contact-form-section {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.contact-form h2 {
  color: #2C3E50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #2C3E50;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: #1A1A1A;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-info,
  .contact-form-section {
    padding: 2rem;
  }
}
</style>