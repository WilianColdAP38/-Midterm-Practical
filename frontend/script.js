/* YOUTUBESTR - script unico para index y reproductor */
 
/* URL base de la API local, cuando suba a S3 cambio aqui si hace falta */
const API_URL = "http://127.0.0.1:8000";
 
 
/* detecto en que pagina estoy mirando el id del grid o del player */
/* si existe grid-videos estoy en el index, si existe video-player estoy en el reproductor */
const enIndex = document.getElementById("grid-videos") !== null;
const enReproductor = document.getElementById("video-player") !== null;
 
if (enIndex) {
  iniciarIndex();
} else if (enReproductor) {
  iniciarReproductor();
}
 
 
/* ========================================
   INDEX
   ======================================== */
 
function iniciarIndex() {
  /* engancho el click de cada chip de categoria */
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      manejarClickChip(chip);
    });
  });
 
  /* carga inicial sin filtro */
  cargarVideos("todos");
}
 
 
/* cuando hago click en un chip cambio el activo y vuelvo a cargar la lista */
function manejarClickChip(chipClickeado) {
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("activo"));
  chipClickeado.classList.add("activo");
 
  const categoria = chipClickeado.dataset.categoria;
  cargarVideos(categoria);
}
 
 
/* hago fetch al backend, si la categoria es todos no mando el query param */
async function cargarVideos(categoria) {
  const grid = document.getElementById("grid-videos");
  const mensaje = document.getElementById("mensaje-estado");
 
  /* limpio el grid antes de pintar de nuevo */
  grid.replaceChildren();
  mensaje.hidden = true;
 
  /* armo la URL con o sin filtro */
  let url = `${API_URL}/videos/`;
  if (categoria !== "todos") {
    url += `?categoria=${encodeURIComponent(categoria)}`;
  }
 
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
 
    const videos = await respuesta.json();
 
    /* si la BD esta vacia o el filtro no tiene resultados muestro mensaje */
    if (videos.length === 0) {
      mostrarMensaje("No hay videos en esta categoria.");
      return;
    }
 
    /* pinto cada card con createElement */
    videos.forEach(video => {
      const card = construirCardVideo(video);
      grid.appendChild(card);
    });
 
  } catch (error) {
    console.error("Error cargando videos:", error);
    mostrarMensaje("No se pudo conectar con la API. Revisa que el backend este corriendo.");
  }
}
 
 
/* construyo una card del grid principal, cero innerHTML */
function construirCardVideo(video) {
  const card = document.createElement("article");
  card.className = "video-card";
  card.addEventListener("click", () => {
    window.location.href = `reproductor.html?id=${video.id}`;
  });
 
  const miniatura = document.createElement("img");
  miniatura.className = "miniatura";
  miniatura.src = video.miniatura;
  miniatura.alt = video.titulo;
  miniatura.loading = "lazy";
 
  const info = document.createElement("div");
  info.className = "info";
 
  const titulo = document.createElement("h3");
  titulo.className = "titulo";
  titulo.textContent = video.titulo;
 
  const categoria = document.createElement("p");
  categoria.className = "categoria";
  categoria.textContent = video.categoria;
 
  info.appendChild(titulo);
  info.appendChild(categoria);
 
  card.appendChild(miniatura);
  card.appendChild(info);
 
  return card;
}
 
 
/* muestra el mensaje de estado para vacio o error */
function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensaje-estado");
  mensaje.textContent = texto;
  mensaje.hidden = false;
}
 
 
/* ========================================
   REPRODUCTOR
   ======================================== */
 
function iniciarReproductor() {
  /* leo el id de la URL con URLSearchParams */
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("id");
 
  /* si no hay id en la URL muestro error y corto */
  if (!videoId) {
    mostrarMensaje("Falta el id del video en la URL.");
    return;
  }
 
  /* lanzo las tres cargas en paralelo, son independientes */
  cargarVideoActual(videoId);
  cargarComentarios(videoId);
  cargarRecomendados(videoId);
 
  /* engancho el submit del formulario para publicar comentarios */
  const form = document.getElementById("form-comentario");
  form.addEventListener("submit", evento => {
    evento.preventDefault();
    publicarComentario(videoId);
  });
}
 
 
/* fetch del video por id y pinto titulo, categoria, descripcion y source */
async function cargarVideoActual(videoId) {
  try {
    const respuesta = await fetch(`${API_URL}/videos/${videoId}`);
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
 
    const video = await respuesta.json();
 
    document.getElementById("video-player").src = video.source;
    document.getElementById("video-titulo").textContent = video.titulo;
    document.getElementById("video-categoria").textContent = video.categoria;
    document.getElementById("video-descripcion").textContent = video.descripcion;
 
  } catch (error) {
    console.error("Error cargando video:", error);
    mostrarMensaje("No se pudo cargar el video.");
  }
}
 
 
/* fetch de comentarios y pinto la lista */
async function cargarComentarios(videoId) {
  const lista = document.getElementById("lista-comentarios");
  lista.replaceChildren();
 
  try {
    const respuesta = await fetch(`${API_URL}/videos/${videoId}/comentarios`);
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
 
    const comentarios = await respuesta.json();
 
    comentarios.forEach(comentario => {
      const elemento = construirComentario(comentario);
      lista.appendChild(elemento);
    });
 
  } catch (error) {
    console.error("Error cargando comentarios:", error);
  }
}
 
 
/* construyo un comentario con createElement */
function construirComentario(comentario) {
  const contenedor = document.createElement("article");
  contenedor.className = "comentario";
 
  const autor = document.createElement("p");
  autor.className = "autor";
  autor.textContent = comentario.autor;
 
  const contenido = document.createElement("p");
  contenido.className = "contenido";
  contenido.textContent = comentario.contenido;
 
  contenedor.appendChild(autor);
  contenedor.appendChild(contenido);
 
  return contenedor;
}
 
 
/* POST de un comentario nuevo, despues recargo la lista */
async function publicarComentario(videoId) {
  const autorInput = document.getElementById("input-autor");
  const contenidoInput = document.getElementById("input-contenido");
 
  const datos = {
    autor: autorInput.value.trim(),
    contenido: contenidoInput.value.trim()
  };
 
  /* validacion basica, los inputs ya tienen required pero por si acaso */
  if (!datos.autor || !datos.contenido) return;
 
  try {
    const respuesta = await fetch(`${API_URL}/videos/${videoId}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
 
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
 
    /* limpio el formulario y recargo la lista para ver el comentario nuevo */
    autorInput.value = "";
    contenidoInput.value = "";
    cargarComentarios(videoId);
 
  } catch (error) {
    console.error("Error publicando comentario:", error);
    alert("No se pudo publicar el comentario.");
  }
}
 
 
/* fetch de los 10 recomendados aleatorios y pinto el aside */
async function cargarRecomendados(videoId) {
  const lista = document.getElementById("lista-recomendados");
  lista.replaceChildren();
 
  try {
    const respuesta = await fetch(`${API_URL}/videos/${videoId}/recomendados`);
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
 
    const recomendados = await respuesta.json();
 
    recomendados.forEach(video => {
      const card = construirCardRecomendado(video);
      lista.appendChild(card);
    });
 
  } catch (error) {
    console.error("Error cargando recomendados:", error);
  }
}
 
 
/* construyo una card del aside, layout horizontal */
function construirCardRecomendado(video) {
  const card = document.createElement("article");
  card.className = "recomendado-card";
  card.addEventListener("click", () => {
    window.location.href = `reproductor.html?id=${video.id}`;
  });
 
  const miniatura = document.createElement("img");
  miniatura.className = "miniatura";
  miniatura.src = video.miniatura;
  miniatura.alt = video.titulo;
  miniatura.loading = "lazy";
 
  const info = document.createElement("div");
  info.className = "info";
 
  const titulo = document.createElement("h4");
  titulo.className = "titulo";
  titulo.textContent = video.titulo;
 
  const categoria = document.createElement("p");
  categoria.className = "categoria";
  categoria.textContent = video.categoria;
 
  info.appendChild(titulo);
  info.appendChild(categoria);
 
  card.appendChild(miniatura);
  card.appendChild(info);
 
  return card;
}