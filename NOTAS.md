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