// src/controllers/peliculasController.js
//traer los datos de data/peliculas.js
const peliculaService = require("../services/PeliculaService");
const pool = require("../config/db");

// GET /api/peliculas
const listarPeliculas = async (req, res, next) => {
  try {
    const { genero, buscar } = req.query;
    const peliculas = await peliculaService.obtenerTodas({ genero, buscar });
    res.json(peliculas);
  } catch (err) {
    next(err);
  }
};

// GET /api/peliculas/:id
const obtenerPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pelicula = await peliculaService.obtenerPorId(id);
    res.json(pelicula);
  } catch (err) {
    next(err);
  }
};

// POST /api/peliculas
const crearPelicula = async (req, res, next) => {
  try {
    // const { titulo, director, anio, genero, nota } = req.body;
    const nueva = await peliculaService.crear(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
};

// PUT /api/peliculas/:id
const actualizarPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const actualizada = await peliculaService.actualizar(id, req.body);
    res.json(actualizada);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/peliculas/:id
const eliminarPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const eliminada = await peliculaService.eliminar(id);
    res.json({ mensaje: "Película eliminada", pelicula: eliminada });
  } catch (err) {
    next(err);
  }
};

// GET /api/peliculas/:id/resenas
const listarResenas = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pelicula = await peliculaService.obtenerPorId(id);
    const resenas = await peliculaService.obtenerResenas(id);

    res.json({ pelicula: pelicula.titulo, resenas });
  } catch (err) {
    next(err);
  }
};

// POST /api/peliculas/:id/resenas
const crearResena = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const nuevaResena = await peliculaService.crearResena(id, req.body);

    res.status(201).json(nuevaResena);
  } catch (err) {
    next(err);
  }
};

// BONUS: PATCH cambiar algunos campos
const modificarPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const actualizada = await peliculaService.actualizar(id, req.body);

    res.json(actualizada);
  } catch (err) {
    next(err);
  }
};

// BONUS: Modificar GET/api/peliculas con paginación ?pagina=1&limite=2

const obtenerPorPaginacion = (req, res) => {
  // =btener parámetros de la query con valores por defecto
  const pagina = Number(req.query.pagina) || 1;
  const limite = Number(req.query.limite) || 10;

  // 2. Obtener todas las películas (o las filtradas si tienes búsqueda)
  const todasLasPeliculas = db.getAll(); // asumiendo que db.getAll() devuelve el array completo
  const total = todasLasPeliculas.length;

  // 3. Lógica de paginación
  // El "inicio" es (pagina - 1) * limite. Ej: Pag 2 con limite 2 empieza en el indice 2.
  const inicio = (pagina - 1) * limite;
  const fin = inicio + limite;

  const data = todasLasPeliculas.slice(inicio, fin);

  // 4. Calcular total de páginas
  const totalPaginas = Math.ceil(total / limite);

  // 5. Enviar respuesta con la estructura solicitada
  res.json({
    data,
    total,
    pagina,
    totalPaginas,
  });
};

// GET /api/estadisticas/directores
const estadisticasDirectores = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        d.nombre AS director,
        COUNT(p.id) AS num_peliculas,
        ROUND(AVG(p.nota), 2) AS nota_media,
        MAX(p.nota) AS nota_maxima,
        MIN(p.nota) AS nota_minima
      FROM directores d
      JOIN peliculas p ON p.director_id = d.id
      GROUP BY d.id, d.nombre
      HAVING COUNT(p.id) >= 1
      ORDER BY nota_media DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/estadisticas/generos
const estadisticasGeneros = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH stats AS (
        SELECT
          g.nombre AS genero,
          COUNT(p.id) AS num_peliculas,
          ROUND(AVG(p.nota), 2) AS nota_media,
          COUNT(r.id) AS total_resenas
        FROM generos g
        LEFT JOIN peliculas p ON p.genero_id = g.id
        LEFT JOIN resenas r ON r.pelicula_id = p.id
        GROUP BY g.id, g.nombre
      )
      SELECT *, RANK() OVER (ORDER BY nota_media DESC NULLS LAST) AS ranking
      FROM stats
      ORDER BY ranking
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/peliculas?buscar
const buscarPeliculas = async (req, res, next) => {
  try {
    // Extraemos 'buscar' de la query string (?buscar=nolan)
    const { buscar } = req.query;

    // Si no hay término, podríamos devolver un error o todas las películas
    if (!buscar) {
      return res
        .status(400)
        .json({ message: "Debes proporcionar un término de búsqueda." });
    }

    // Llamamos al servicio pasando el término dinámico
    const peliculas = await peliculaService.buscarFullText(buscar);

    res.json(peliculas);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  listarResenas,
  crearResena,
  modificarPelicula,
  obtenerPorPaginacion,
  estadisticasDirectores,
  estadisticasGeneros,
  buscarPeliculas,
};
