const API_URL = "http://localhost:8000/api";

let categoriaActual = "";

document.addEventListener("DOMContentLoaded", () => {
    cargarChips();
    cargarVideos();
});


function cargarChips() {
    const chipsBar = document.getElementById("chipsBar");

    const chipTodos = crearChip("Todos", "", true);
    chipsBar.appendChild(chipTodos);

    fetch(`${API_URL}/categories`)
        .then(res => res.json())
        .then(categorias => {
            categorias.forEach(cat => {
                const chip = crearChip(cat.nombre, cat.slug, false);
                chipsBar.appendChild(chip);
            });
        })
        .catch(err => console.error("Error chips:", err));
}


function crearChip(texto, slug, activo) {
    const chip = document.createElement("button");
    chip.className = activo ? "chip active" : "chip";
    chip.textContent = texto;
    chip.dataset.slug = slug;
    chip.addEventListener("click", () => cambiarCategoria(slug));
    return chip;
}


function cambiarCategoria(slug) {
    categoriaActual = slug;
    document.querySelectorAll(".chip").forEach(c => {
        if (c.dataset.slug === slug) c.classList.add("active");
        else c.classList.remove("active");
    });
    cargarVideos();
}


function cargarVideos() {
    const grid = document.getElementById("videoGrid");

    while (grid.firstChild) grid.removeChild(grid.firstChild);

    const cargando = document.createElement("p");
    cargando.className = "cargando";
    cargando.textContent = "Cargando videos...";
    grid.appendChild(cargando);

    const url = categoriaActual
        ? `${API_URL}/videos?categoria=${categoriaActual}`
        : `${API_URL}/videos`;

    fetch(url)
        .then(res => res.json())
        .then(videos => {
            grid.removeChild(cargando);

            if (videos.length === 0) {
                const vacio = document.createElement("p");
                vacio.className = "vacio";
                vacio.textContent = "No hay videos en esta categoría.";
                grid.appendChild(vacio);
                return;
            }

            videos.forEach(video => {
                grid.appendChild(crearTarjeta(video));
            });
        })
        .catch(err => {
            console.error("Error videos:", err);
            grid.removeChild(cargando);
            const error = document.createElement("p");
            error.className = "error";
            error.textContent = "Error al cargar videos. Verifica que la API esté corriendo.";
            grid.appendChild(error);
        });
}


function crearTarjeta(video) {
    const card = document.createElement("article");
    card.className = "video-card";
    card.addEventListener("click", () => {
        window.location.href = `player.html?id=${video.id}`;
    });

    // Thumbnail
    const thumbWrapper = document.createElement("div");
    thumbWrapper.className = "thumb-wrapper";

    const img = document.createElement("img");
    img.src = video.url_miniatura;
    img.alt = video.titulo;
    img.loading = "lazy";

    const duracion = document.createElement("span");
    duracion.className = "duracion-badge";
    duracion.textContent = formatearDuracion(video.duracion_segundos);

    thumbWrapper.appendChild(img);
    thumbWrapper.appendChild(duracion);

    // Info
    const info = document.createElement("div");
    info.className = "video-info";

    const avatar = document.createElement("img");
    avatar.className = "channel-avatar";
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.canal)}&background=random&color=fff`;
    avatar.alt = video.canal;

    const text = document.createElement("div");
    text.className = "video-text";

    const titulo = document.createElement("h3");
    titulo.textContent = video.titulo;

    const canal = document.createElement("p");
    canal.textContent = video.canal;

    const stats = document.createElement("p");
    stats.textContent = `${formatearVistas(video.vistas)} vistas · ${tiempoRelativo(video.fecha_subida)}`;

    const cat = document.createElement("span");
    cat.className = `video-categoria cat-${video.categoria}`;
    cat.textContent = video.categoria.toUpperCase();

    text.appendChild(titulo);
    text.appendChild(canal);
    text.appendChild(stats);
    text.appendChild(cat);

    info.appendChild(avatar);
    info.appendChild(text);

    card.appendChild(thumbWrapper);
    card.appendChild(info);

    return card;
}


function formatearDuracion(seg) {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
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