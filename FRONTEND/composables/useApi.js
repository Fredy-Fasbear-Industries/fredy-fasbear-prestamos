export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  if (!baseURL) {
    throw new Error('NUXT_PUBLIC_API_BASE no está configurado en las variables de entorno')
  }

  const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await $fetch(url, { baseURL, ...options })
        return response
      } catch (error) {
        const isRetryable = error.statusCode === 500 || error.statusCode === 503
        const shouldRetry = isRetryable && attempt < maxRetries
        
        if (shouldRetry) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }

        if (error.statusCode === 401 && process.client) {
          const { logout } = useAuth()
          logout()
          navigateTo('/login')
        }

        throw error
      }
    }
  }

  const createRequest = (method) => {
    return (url, body = null, customOptions = {}) => {
      const options = {
        method,
        ...customOptions
      }

      if (process.client) {
        const { getToken } = useAuth()
        const token = getToken()
        
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        }
      }

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = body
      }

      return fetchWithRetry(url, options)
    }
  }

  const api = $fetch.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    onRequest({ options }) {
      if (process.client) {
        const { getToken } = useAuth()
        const token = getToken()
        
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
        const { logout } = useAuth()
        logout()
        setTimeout(() => navigateTo('/login'), 100)
      }
    }
  })

  return { 
    api,
    get: createRequest('GET'),
    post: createRequest('POST'),
    put: createRequest('PUT'),
    patch: createRequest('PATCH'),
    delete: createRequest('DELETE'),
    $api: (url, options = {}) => api(url, options)
  }
}