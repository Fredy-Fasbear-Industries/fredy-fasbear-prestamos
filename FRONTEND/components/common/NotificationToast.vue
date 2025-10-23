<template>
  <div class="notification-container" v-if="show">
    <div class="notification" :class="`notification-${type}`">
      <div class="notification-content">
        <svg v-if="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <svg v-else-if="type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else-if="type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M12 16V12" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8H12.01" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else-if="type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
        <span>{{ message }}</span>
      </div>
      <button @click="$emit('close')" class="notification-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1100;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 25px 50px rgba(26, 26, 26, 0.25);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-success {
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.95), rgba(5, 150, 105, 0.95));
  color: var(--color-blanco-perla);
}

.notification-error {
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.95), rgba(220, 38, 38, 0.95));
  color: var(--color-blanco-perla);
}

.notification-info {
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.95), rgba(59, 130, 246, 0.95));
  color: var(--color-blanco-perla);
}

.notification-warning {
  background: linear-gradient(135deg, rgba(180, 83, 9, 0.95), rgba(245, 158, 11, 0.95));
  color: var(--color-blanco-perla);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.notification-content svg {
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-close {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .notification-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .notification {
    max-width: 100%;
  }
}
</style>