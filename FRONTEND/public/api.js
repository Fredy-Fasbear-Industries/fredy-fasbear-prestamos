export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  return {
    provide: {
      apiBase: config.public.apiBase,
      siteUrl: config.public.siteUrl
    }
  }
})