const API_URL = "http://localhost:8000/api";
const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");


document.addEventListener("DOMContentLoaded", () => {
    if (!videoId) {
        mostrarError("No se especificó un video.");
        return;
    }
    cargarVideo();
    cargarRecomendaciones();
});


function cargarVideo() {
    fetch(`${API_URL}/videos/${videoId}`)
        .then(res => {
            if (!res.ok) throw new Error("No encontrado");
            return res.json();
        })
        .then(video => renderizarVideo(video))
        .catch(err => {
            console.error("Error video:", err);
            mostrarError("No se pudo cargar el video.");
        });
}


function renderizarVideo(video) {
    const main = document.getElementById("playerMain");
    while (main.firstChild) main.removeChild(main.firstChild);

    // Video player
    const player = document.createElement("video");
    player.className = "video-player";
    player.src = video.url_video;
    player.controls = true;
    player.poster = video.url_miniatura;

    // Título
    const titulo = document.createElement("h1");
    titulo.className = "player-titulo";
    titulo.textContent = video.titulo;

    // Meta (canal + stats)
    const meta = document.createElement("div");
    meta.className = "player-meta";

    const canalDiv = document.createElement("div");
    canalDiv.className = "player-canal";

    const canalAvatar = document.createElement("img");
    canalAvatar.className = "canal-avatar";
    canalAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.canal)}&background=random&color=fff`;
    canalAvatar.alt = video.canal;

    const canalNombre = document.createElement("span");
    canalNombre.className = "canal-nombre";
    canalNombre.textContent = video.canal;

    canalDiv.appendChild(canalAvatar);
    canalDiv.appendChild(canalNombre);

    const stats = document.createElement("div");
    stats.className = "player-stats";
    stats.textContent = `${formatearVistas(video.vistas)} vistas · ${tiempoRelativo(video.fecha_subida)}`;

    meta.appendChild(canalDiv);
    meta.appendChild(stats);

    // Descripción
    const desc = document.createElement("div");
    desc.className = "player-descripcion";

    const catSpan = document.createElement("span");
    catSpan.className = `video-categoria cat-${video.categoria}`;
    catSpan.textContent = video.categoria.toUpperCase();
    catSpan.style.marginBottom = "8px";
    catSpan.style.display = "inline-block";

    const descTexto = document.createElement("p");
    descTexto.textContent = video.descripcion;

    desc.appendChild(catSpan);
    desc.appendChild(document.createElement("br"));
    desc.appendChild(descTexto);

    // Sección comentarios
    const comentariosSection = crearSeccionComentarios();

    main.appendChild(player);
    main.appendChild(titulo);
    main.appendChild(meta);
    main.appendChild(desc);
    main.appendChild(comentariosSection);

    cargarComentarios();
}


function crearSeccionComentarios() {
    const section = document.createElement("section");
    section.className = "comments-section";

    const titulo = document.createElement("h3");
    titulo.className = "comments-title";
    titulo.id = "comentariosTitulo";
    titulo.textContent = "Comentarios";

    const form = document.createElement("form");
    form.className = "comment-form";
    form.id = "formComentario";

    const inputAutor = document.createElement("input");
    inputAutor.type = "text";
    inputAutor.placeholder = "Tu nombre";
    inputAutor.required = true;
    inputAutor.id = "inputAutor";

    const inputContenido = document.createElement("textarea");
    inputContenido.placeholder = "Añade un comentario...";
    inputContenido.required = true;
    inputContenido.id = "inputContenido";

    const acciones = document.createElement("div");
    acciones.className = "comment-form-actions";

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "btn-comentar";
    btn.textContent = "Comentar";

    acciones.appendChild(btn);
    form.appendChild(inputAutor);
    form.appendChild(inputContenido);
    form.appendChild(acciones);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        enviarComentario(inputAutor.value, inputContenido.value);
    });

    const lista = document.createElement("div");
    lista.className = "comments-list";
    lista.id = "comentariosLista";

    section.appendChild(titulo);
    section.appendChild(form);
    section.appendChild(lista);

    return section;
}


function cargarComentarios() {
    fetch(`${API_URL}/videos/${videoId}/comments`)
        .then(res => res.json())
        .then(comentarios => renderizarComentarios(comentarios))
        .catch(err => console.error("Error comentarios:", err));
}


function renderizarComentarios(comentarios) {
    const lista = document.getElementById("comentariosLista");
    const titulo = document.getElementById("comentariosTitulo");
    if (!lista) return;

    while (lista.firstChild) lista.removeChild(lista.firstChild);

    titulo.textContent = `${comentarios.length} comentarios`;

    if (comentarios.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "comments-vacio";
        vacio.textContent = "Sé el primero en comentar.";
        lista.appendChild(vacio);
        return;
    }

    comentarios.forEach(c => lista.appendChild(crearComentario(c)));
}


function crearComentario(comentario) {
    const div = document.createElement("article");
    div.className = "comment";

    const avatar = document.createElement("img");
    avatar.className = "comment-avatar";
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comentario.autor)}&background=random&color=fff`;
    avatar.alt = comentario.autor;

    const body = document.createElement("div");
    body.className = "comment-body";

    const header = document.createElement("div");
    header.className = "comment-header";

    const autor = document.createElement("span");
    autor.className = "comment-autor";
    autor.textContent = comentario.autor;

    const fecha = document.createElement("span");
    fecha.className = "comment-fecha";
    fecha.textContent = tiempoRelativo(comentario.fecha);

    header.appendChild(autor);
    header.appendChild(fecha);

    const contenido = document.createElement("p");
    contenido.className = "comment-contenido";
    contenido.textContent = comentario.contenido;

    body.appendChild(header);
    body.appendChild(contenido);

    div.appendChild(avatar);
    div.appendChild(body);

    return div;
}


function enviarComentario(autor, contenido) {
    if (!autor.trim() || !contenido.trim()) return;

    fetch(`${API_URL}/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autor: autor.trim(), contenido: contenido.trim() }),
    })
        .then(res => {
            if (!res.ok) throw new Error("Error al publicar");
            return res.json();
        })
        .then(() => {
            document.getElementById("inputAutor").value = "";
            document.getElementById("inputContenido").value = "";
            cargarComentarios();
        })
        .catch(err => {
            console.error("Error enviando:", err);
            alert("No se pudo publicar el comentario.");
        });
}


function cargarRecomendaciones() {
    fetch(`${API_URL}/videos/${videoId}/recommendations`)
        .then(res => res.json())
        .then(videos => renderizarRecomendaciones(videos))
        .catch(err => console.error("Error rec:", err));
}


function renderizarRecomendaciones(videos) {
    const lista = document.getElementById("recList");
    while (lista.firstChild) lista.removeChild(lista.firstChild);

    if (videos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "vacio";
        vacio.textContent = "Sin recomendaciones.";
        lista.appendChild(vacio);
        return;
    }

    videos.forEach(v => lista.appendChild(crearRecomendacion(v)));
}


function crearRecomendacion(video) {
    const card = document.createElement("div");
    card.className = "rec-card";
    card.addEventListener("click", () => {
        window.location.href = `player.html?id=${video.id}`;
    });

    const thumb = document.createElement("img");
    thumb.className = "rec-thumb";
    thumb.src = video.url_miniatura;
    thumb.alt = video.titulo;
    thumb.loading = "lazy";

    const info = document.createElement("div");
    info.className = "rec-info";

    const titulo = document.createElement("h4");
    titulo.className = "rec-titulo";
    titulo.textContent = video.titulo;

    const canal = document.createElement("p");
    canal.className = "rec-canal";
    canal.textContent = video.canal;

    const stats = document.createElement("p");
    stats.className = "rec-stats";
    stats.textContent = `${formatearVistas(video.vistas)} vistas`;

    info.appendChild(titulo);
    info.appendChild(canal);
    info.appendChild(stats);

    card.appendChild(thumb);
    card.appendChild(info);

    return card;
}


function mostrarError(mensaje) {
    const main = document.getElementById("playerMain");
    while (main.firstChild) main.removeChild(main.firstChild);

    const error = document.createElement("p");
    error.className = "error";
    error.textContent = mensaje;
    main.appendChild(error);
}


function formatearVistas(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
}


function tiempoRelativo(fechaIso) {
    const fecha = new Date(fechaIso);
    const ahora = new Date();
    const segundos = Math.floor((ahora - fecha) / 1000);

    if (segundos < 60) return "hace un momento";
    if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} min`;
    if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)} h`;
    if (segundos < 2592000) return `hace ${Math.floor(segundos / 86400)} d`;
    return `hace ${Math.floor(segundos / 2592000)} meses`;
}