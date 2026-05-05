const express = require('express');
const router = express.Router();
const peliculaService = require('../services/PeliculaService');
const { estadisticasDirectores,
  estadisticasGeneros } = require('../controllers/peliculasController');

router.get('/directores', estadisticasDirectores)
router.get('/generos', estadisticasGeneros)

router.get('/estadisticas', async (req, res, next) => {
  try {
    const stats = await peliculaService.obtenerEstadisticas();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});



module.exports = router;