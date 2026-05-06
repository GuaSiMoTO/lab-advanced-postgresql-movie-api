## PASO 1: Pregunta: ¿Por qué usamos LEFT JOIN en lugar de INNER JOIN? ¿Qué filas se perderían con INNER JOIN?

Porque queremos traer todas las peliculas aunque no tengan director ni genero.

## PASO 5: Pregunta: ¿Qué películas tienen usuarios más entusiastas que la crítica? ¿Y al revés?

Sobre todo The Dark knight que la crítica lo califico con un 9.0 y los usuarios con un 10.00. Pero le siguen otras 5 peliculas más donde los usuarios dieron mas puntuación que la crítica de profesionales: Oppenheimer 8.5 / 9.00, Dune 8.0 / 8.5, Inception 8.8 / 9.00...

La query:

WITH medias_usuarios AS (
  SELECT
    pelicula_id,
    ROUND(AVG(puntuacion), 2) AS media_usuarios,
    COUNT(*) AS num_resenas
  FROM resenas
  GROUP BY pelicula_id
),
comparacion AS (
  SELECT
    p.titulo,
    p.nota AS nota_editorial,
    mu.media_usuarios,
    mu.num_resenas,
    ROUND(mu.media_usuarios - p.nota, 2) AS diferencia
  FROM peliculas p
  JOIN medias_usuarios mu ON mu.pelicula_id = p.id
)
SELECT *
FROM comparacion
ORDER BY diferencia DESC;

Resultado:


![alt text](image.png)

## PASO 7: Pregunta: ¿Qué directores tienen una trayectoria ascendente (cada película mejor que la anterior)?
Christopher Nolan solo mejoró en su última película "Oppenheimer" 2023 con una diferencia de 1.10 con la anterior y destacar también a Denis Villenueve con "Dune" 2021 que mejoró con un 0.10.

## PARTE 8: Reflexión

### 1. ¿Cuándo es contraproducente crear un índice? (pista: piensa en tablas con muchas escrituras)
Cuando hay pocas filas, porque tardará más en consultar el indice que leer en la tabla directamente, y ocupan espacio en memoria.

### 2. ¿Qué diferencia hay entre RANK() y DENSE_RANK()? Pon un ejemplo con los datos de la base de datos.
si usas RANK() y hay un empate en el puesto 1, con la misma nota, la siguiente película saltará al puesto 3. Pero si usas DENSE_RANK(), y hay un empate en el puesto 1, la siguiente película será el puesto 2, no deja huecos en medio y en RANK() si deja huecos.


### 3.¿Por qué el trigger usa AFTER INSERT OR UPDATE OR DELETE en lugar de BEFORE?
Se utiliza AFTER para asegurar que el cambio se registró con éxito en la tabla principal antes de guardarlo en la auditoría, evitando así registrar operaciones que fallaron o fueron rechazadas.

## BONUS: 

### 1.Script de migración versionado: Crea una carpeta migrations/ con archivos 001_initial.sql, 002_add_auditoria.sql, 003_add_indexes.sql. Cada script debe ser idempotente (ejecutable múltiples veces sin error). Añade una tabla schema_migrations que registre qué migraciones se han aplicado.
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    aplicada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
Carpeta migrations/ creada y archivos también.

### 2.Full-text search: Usa tsvector y tsquery para implementar búsqueda de texto en títulos y nombres de directores. Añade un índice GIN y un endpoint GET /api/peliculas?buscar=nolan.

La búsqueda normal con `LIKE %nolan%` es muy lenta en tablas grandes. PostgreSQL usa **FTS** (Full Text Search) para buscar de forma "inteligente".

### El concepto: tsvector y tsquery
*   **`tsvector`**: Convierte un texto en una lista de palabras clave (lexemas) optimizadas.
*   **`tsquery`**: Es la consulta que busca dentro de esos lexemas.


### Implementación:
Para buscar por título y director al mismo tiempo, creamos un **índice GIN** (Generalized Inverted Index).

```sql
-- 1. Creamos el índice GIN combinando título y director
CREATE INDEX idx_busqueda_pelicula ON peliculas 
USING GIN (to_tsvector('spanish', titulo));

-- 2. La consulta para tu endpoint GET /api/peliculas?buscar=nolan
SELECT p.titulo, d.nombre as director
FROM peliculas p
JOIN directores d ON p.director_id = d.id
WHERE to_tsvector('spanish', p.titulo || ' ' || d.nombre) @@ to_tsquery('spanish', $1), ['nolan'];
```
El operador @@ significa "¿coincide el vector con esta consulta?".

### 3.Función SQL personalizada: Crea una función PostgreSQL peliculas_del_director(nombre_director TEXT) que devuelva las películas de ese director con sus estadísticas de reseñas.
```sql
CREATE OR REPLACE FUNCTION peliculas_del_director(nombre_buscado TEXT)
RETURNS TABLE (
    peli_titulo TEXT,
    peli_anio INT,
    promedio_usuarios DECIMAL,
    total_resenas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.titulo, 
        p.anio, 
        ROUND(AVG(r.puntuacion), 2), 
        COUNT(r.id)
    FROM peliculas p
    JOIN directores d ON p.director_id = d.id
    LEFT JOIN resenas r ON r.pelicula_id = p.id
    WHERE d.nombre ILIKE '%' || nombre_buscado || '%'
    GROUP BY p.id, p.titulo, p.anio;
END;
$$ LANGUAGE plpgsql;
```

Así llamado desde el código:
```sql
SELECT * FROM peliculas_del_director('Christopher Nolan');
```
