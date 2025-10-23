

import express from 'express';
import homepageController from '../controllers/homepage.controller.js';

const router = express.Router();

// Middleware para logging de rutas de homepage
router.use((req, res, next) => {
  console.log(` Homepage API: ${req.method} ${req.path}`);
  next();
});

// ===== RUTAS DE HOMEPAGE =====

/**
 * GET /api/homepage/data
 * Obtiene todos los datos principales de la homepage
 */
router.get('/data', homepageController.getHomeData);

/**
 * GET /api/homepage/stats
 * Obtiene estadísticas dinámicas para mostrar en la homepage
 */
router.get('/stats', homepageController.getStats);

/**
 * GET /api/homepage/featured-products
 * Obtiene productos destacados para mostrar en la homepage
 * Query params: limit (número de productos a devolver)
 */
router.get('/featured-products', homepageController.getFeaturedProducts);

/**
 * POST /api/homepage/contact
 * Envía mensaje de contacto desde la homepage
 * Body: { name, email, phone?, message, subject? }
 */
router.post('/contact', homepageController.sendContactMessage);

/**
 * POST /api/homepage/newsletter
 * Suscribe email al newsletter
 * Body: { email, name? }
 */
router.post('/newsletter', homepageController.subscribeNewsletter);

// ===== MIDDLEWARE DE ERROR ESPECÍFICO PARA HOMEPAGE =====
router.use((error, req, res, next) => {
  console.error(' Error en rutas de homepage:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de homepage',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;