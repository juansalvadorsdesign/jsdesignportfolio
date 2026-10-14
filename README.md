# jsdesignportfolio.com

Webfolio de Juan Salvador Aguilar Gómez, diseñador gráfico y fotógrafo. Web estática: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Estructura

```
index.html                     Inicio
sangre-del-sur.html            Una mano · 01
lanjaron.html                  Una mano · 02
life-interchanging-films.html  Una mano · 03
creativelab.html               Mil manos · 01
congreso-aja.html              Mil manos · 02 (incluye la pieza animada de los ámbitos)
surtopias.html                 Mil manos · 03
404.html                       Página no encontrada
css/estilos.css                Variables y tipografía del sistema Juan Salvador, maquetación y movimiento
js/main.js                     Animaciones (scroll, tinta de Sangre del Sur, ámbitos de AJÁ!)
fonts/                         Zalando Sans SemiExpanded (variable, latín) y su licencia OFL
img/                           Imágenes WebP en varios anchos (nombre-800.webp, nombre-1400.webp…)
img/og/                        Imágenes para compartir en redes (1200 × 630)
docs/cv-juan-salvador.pdf      Currículum descargable
```

## Animaciones

Cada elemento animado lleva `data-anim` con su tipo: `subir`, `mascara`, `telon`, `filete`, `palabras`, `lineas` o `tinta`. Para animar un elemento nuevo basta con añadirle el atributo. Sin JavaScript, o con «reducir movimiento» activado en el sistema, la web se ve quieta y completa.

## Publicación

El dominio jsdesignportfolio.com está en IONOS. La web se publica con IONOS Deploy Now desde este repositorio: cada cambio en la rama principal se publica solo. Es un sitio estático: no necesita comando de compilación y la carpeta de publicación es la raíz del repositorio.
