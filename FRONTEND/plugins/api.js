 export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  if (!baseURL) {
    console.error('NUXT_PUBLIC_API_BASE no está configurado')
  }

  const api = $fetch.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    onRequest({ options }) {
      if (process.client) {
        const token = localStorage.getItem('authToken')
        
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401 && process.client) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        navigateTo('/login')
      }
    }
  })

  return {
    provide: {
      api: (url, options = {}) => api(url, options)
    }
  }
})