CREATE TABLE IF NOT EXISTS directores (id SERIAL PRIMARY KEY, nombre TEXT);
CREATE TABLE IF NOT EXISTS generos (id SERIAL PRIMARY KEY, nombre TEXT);
CREATE TABLE IF NOT EXISTS peliculas (
    id SERIAL PRIMARY KEY, 
    titulo TEXT, 
    anio INT, 
    nota DECIMAL, 
    director_id INT REFERENCES directores(id),
    genero_id INT REFERENCES generos(id)
);