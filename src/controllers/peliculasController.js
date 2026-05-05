// src/controllers/peliculasController.js
//traer los datos de data/peliculas.js
const peliculaService = require('../services/PeliculaService');

// GET /api/peliculas
const listarPeliculas = async (req, res,next) => {
  try {
    const { genero , buscar} = req.query;
    const peliculas = await peliculaService.obtenerTodas({genero,buscar});
    res.json(peliculas);
  } catch (err) {
    next(err);
  }
};

const buscarPorDirector = async (req, res, next) => {
  try {
    const { director } = req.query;
    const peliculas = await peliculaService.buscarPorDirector(director);
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
const crearPelicula = async (req, res,next) => {
  try {
    // const { titulo, director, anio, genero, nota } = req.body;
    const nueva = await peliculaService.crear(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
};

// PUT /api/peliculas/:id
const actualizarPelicula = async (req, res,next) => {
  try {
    const id = Number(req.params.id);
    const actualizada = await peliculaService.actualizas(id,req.body)
    res.json(actualizada);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/peliculas/:id
const eliminarPelicula = async (req, res,next) => {
  try {
  const id = Number(req.params.id);
  const eliminada = await peliculaService.eliminar(id)
  res.json({ mensaje: "Película eliminada", pelicula: eliminada });

}catch (err) {
  next(err)
}
};

// GET /api/peliculas/:id/resenas
const listarResenas = async (req, res,next) => {
  try {
  const id = Number(req.params.id);
  const pelicula = await peliculaService.obtenerPorId(id);
  const resenas = await peliculaService.obtenerResenas(id)

  res.json({ pelicula: pelicula.titulo, resenas });
 }catch(err) {
  next(err)
 }
};

// POST /api/peliculas/:id/resenas
const crearResena = async (req, res,next) => {
  try{
  const id = Number(req.params.id);
  const nuevaResena = await peliculaService.crearResena(id,req.body)

  res.status(201).json(nuevaResena);
} catch(err){
  next(err)
}
};

// BONUS: PATCH cambiar algunos campos
const modificarPelicula = async (req, res, next) => {
  try {
  const id = Number(req.params.id);
  const actualizada = await peliculaService.actualizar(id,req.body);

  res.json(actualizada);
} catch(err) {
  next(err)
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

module.exports = {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  buscarPorDirector,
  actualizarPelicula,
  eliminarPelicula,
  listarResenas,
  crearResena,
  modificarPelicula,
  obtenerPorPaginacion,
};
