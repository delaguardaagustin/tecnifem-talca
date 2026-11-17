/* Carga los textos y productos que Tecnifem edita en su panel (/admin) y arma la tienda con carro.
   Si un archivo no carga, la página se queda con el texto que ya trae el HTML. */
(function () {
  var WA = "56945213431";
  // Cuando esté conectado el pago con Flow, aquí va la dirección del servicio que crea el pago.
  var PAGO_URL = "";

  function $(id) { return document.getElementById(id); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function destacado(t) { return esc(t).replace(/\*([^*]+)\*/g, "<em>$1</em>"); }
  function txt(id, v, html) { var e = $(id); if (e && v != null && v !== "") e[html ? "innerHTML" : "textContent"] = html ? destacado(v) : v; }
  function pesos(n) { return "$" + Math.round(n).toLocaleString("es-CL"); }
  function abrirWA(m) { window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(m), "_blank", "noopener"); }
  function cargar(ruta) { return fetch(ruta + "?v=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(ruta); return r.json(); }); }

  /* ---------- textos ---------- */
  var TEL0 = "+56 9 4521 3431", WA0 = "56945213431";
  function img(id, src) { var e = $(id); if (e && src) e.src = src; }
  function clases(cl, v) { if (v == null || v === "") return; document.querySelectorAll("." + cl).forEach(function (e) { e.textContent = v; }); }

  function cambiarContacto(c) {
    var tel = (c.telefono || "").trim(), wa = String(c.whatsapp || "").replace(/\D/g, "");
    if (wa) WA = wa;
    var telLimpio = tel.replace(/[^\d+]/g, "");
    document.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (telLimpio && h.indexOf("tel:") === 0) a.setAttribute("href", "tel:" + telLimpio);
      if (wa && h.indexOf("wa.me/" + WA0) > -1) a.setAttribute("href", h.replace("wa.me/" + WA0, "wa.me/" + wa));
      if (c.instagram && h.indexOf("instagram.com/") > -1) a.setAttribute("href", "https://www.instagram.com/" + c.instagram.replace(/^@/, "") + "/");
    });
    if (tel && tel !== TEL0) {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) if (n.nodeValue.indexOf(TEL0) > -1) n.nodeValue = n.nodeValue.split(TEL0).join(tel);
    }
    if (c.instagram) document.querySelectorAll('a[href*="instagram.com/"]').forEach(function (a) { a.childNodes.forEach(function (t) { if (t.nodeType === 3 && t.nodeValue.indexOf("@") > -1) t.nodeValue = "@" + c.instagram.replace(/^@/, ""); }); });
    if (window.ASISTENTE && wa) window.ASISTENTE.wa = wa;
    txt("c-hor-franja", c.horario_corto); txt("c-hor1", c.horario_corto);
    txt("c-hor2", c.horario_detalle); txt("c-zona", c.zona); txt("c-zona-franja", c.zona);
    if (c.instagram && $("v-ig")) $("v-ig").href = "https://www.instagram.com/" + c.instagram.replace(/^@/, "") + "/";
    if ($("v-tk")) { $("v-tk").hidden = !c.tiktok; if (c.tiktok) $("v-tk").href = "https://www.tiktok.com/@" + c.tiktok.replace(/^@/, ""); }
    var tk = $("c-tiktok");
    if (tk) { tk.hidden = !c.tiktok; if (c.tiktok) { tk.href = "https://www.tiktok.com/@" + c.tiktok.replace(/^@/, ""); tk.textContent = "TikTok @" + c.tiktok.replace(/^@/, ""); } }
  }

  function pintarTextos(s) {
    if (s.aviso && s.aviso.texto) document.documentElement.style.setProperty("--aviso-txt", JSON.stringify(s.aviso.texto));
    if (s.aviso && s.aviso.texto === "") document.documentElement.style.setProperty("--aviso-txt", "none");
    if (s.portada) { txt("c-ojo", s.portada.etiqueta); txt("c-titulo", s.portada.titulo, true); txt("c-bajada", s.portada.bajada); img("c-foto", s.portada.foto); img("c-foto2", s.portada.foto2); txt("c-eslogan", s.portada.eslogan); }
    var n = s.nosotros;
    if (n) {
      txt("n-titulo", n.titulo, true); txt("n-texto", n.texto); img("n-foto", n.foto);
      if (Array.isArray(n.puntos) && n.puntos.length && $("n-puntos")) {
        $("n-puntos").innerHTML = n.puntos.map(function (p) { return '<li><svg aria-hidden="true"><use href="#ok"/></svg><span><b>' + esc(p.titulo) + "</b> " + esc(p.texto) + "</span></li>"; }).join("");
      }
    }
    if (Array.isArray(s.pasos) && s.pasos.length && $("p-pasos")) {
      $("p-pasos").innerHTML = s.pasos.map(function (p) { return "<li><h3>" + esc(p.titulo) + "</h3><p>" + esc(p.texto) + "</p></li>"; }).join("");
    }
    var v = s.videos;
    if (v && $("v-lista")) {
      txt("v-titulo", v.titulo, true); txt("v-bajada", v.bajada);
      var vids = (v.lista || []).filter(function (x) { return x && x.enlace; });
      $("videos").hidden = !vids.length;
      $("v-lista").innerHTML = vids.map(function (x) {
        var m = String(x.enlace).match(/instagram\.com\/(?:[^\/]+\/)?(reel|p)\/([A-Za-z0-9_-]+)/);
        var emb = m ? "https://www.instagram.com/" + m[1] + "/" + m[2] + "/embed" : "";
        return '<button type="button" class="vid" data-emb="' + esc(emb) + '" data-url="' + esc(x.enlace) + '" aria-label="Ver video: ' + esc(x.titulo) + '">' + (x.portada ? '<img src="' + esc(x.portada) + '" alt="" loading="lazy">' : "") + '<span class="play"><svg aria-hidden="true"><use href="#play"/></svg></span><span class="t">' + esc(x.titulo) + "</span></button>";
      }).join("");
    }
    var g = s.galeria, gs = $("trabajos");
    if (gs) {
      var fotos = (g && Array.isArray(g.fotos)) ? g.fotos.filter(function (f) { return f && f.foto; }) : [];
      gs.hidden = !fotos.length;
      if (fotos.length) {
        txt("g-titulo", g.titulo, true); txt("g-bajada", g.bajada);
        $("g-fotos").innerHTML = fotos.map(function (f) { return '<figure><img src="' + esc(f.foto) + '" alt="' + esc(f.texto || "Trabajo de Tecnifem") + '" loading="lazy">' + (f.texto ? "<figcaption>" + esc(f.texto) + "</figcaption>" : "") + "</figure>"; }).join("");
      }
    }
    var r = s.resenas;
    if (r) {
      clases("r-nota", r.nota); clases("r-cant", r.cantidad);
      if (Array.isArray(r.lista) && r.lista.length && $("r-lista")) {
        var cab = $("r-lista").querySelector(".nota-g");
        $("r-lista").innerHTML = "";
        if (cab) $("r-lista").appendChild(cab);
        r.lista.slice(0, 3).forEach(function (x) {
          var fig = document.createElement("figure"); fig.className = "res";
          fig.innerHTML = '<span class="est" aria-label="5 de 5 estrellas">★★★★★</span><p>«' + esc(x.texto) + "»</p><cite>" + esc(x.autor) + ", en Google</cite>";
          $("r-lista").appendChild(fig);
        });
      }
    }
    if (Array.isArray(s.preguntas) && s.preguntas.length && $("f-preguntas")) {
      $("f-preguntas").innerHTML = s.preguntas.map(function (p, i) { return "<details" + (i ? "" : " open") + "><summary>" + esc(p.pregunta) + "</summary><p>" + esc(p.respuesta) + "</p></details>"; }).join("");
    }
    if (s.contacto) cambiarContacto(s.contacto);
  }

  /* ---------- servicios ---------- */
  var servicios = [], filtroS = "Principales";
  function pintarServicios(sv) {
    if (!sv) return;
    txt("s-titulo", sv.titulo, true); txt("s-bajada", sv.bajada); txt("s-nota", sv.nota);
    servicios = (sv.servicios || []).filter(function (x) { return x && x.nombre && x.visible !== false; });
    if (!servicios.length) return;
    if ($("cifra-serv")) $("cifra-serv").textContent = servicios.length > 9 ? "+" + Math.floor(servicios.length / 5) * 5 : String(servicios.length);
    var hayDest = servicios.some(function (x) { return x.destacado; });
    if (!hayDest) filtroS = "Todos";
    var cats = hayDest ? ["Principales"] : [];
    servicios.forEach(function (x) { var c = x.categoria || "Otros"; if (cats.indexOf(c) < 0) cats.push(c); });
    cats.push("Todos");
    $("s-filtros").innerHTML = cats.map(function (c) { return '<button type="button" class="chip' + (c === filtroS ? " on" : "") + '" data-scat="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
    dibujarServicios();
  }
  function dibujarServicios() {
    var vis = servicios.filter(function (x) { return filtroS === "Todos" || (filtroS === "Principales" ? x.destacado : (x.categoria || "Otros") === filtroS); });
    $("s-lista").className = "s-grilla";
    $("s-lista").innerHTML = vis.map(function (x) {
      return '<article class="s-item"><span class="t-cat">' + esc(x.categoria || "") + "</span><h3>" + esc(x.nombre) + "</h3>" + (x.descripcion ? "<p>" + esc(x.descripcion) + "</p>" : "") + '<a class="s-cot" data-s="' + esc(x.nombre) + '" href="#">Cotizar por WhatsApp →</a></article>';
    }).join("");
  }

  // Videos: al tocar se carga el video de Instagram dentro de la tarjeta
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".vid[data-url]");
    if (!b || b.classList.contains("on")) return;
    var emb = b.getAttribute("data-emb");
    if (!emb) { window.open(b.getAttribute("data-url"), "_blank", "noopener"); return; }
    b.classList.add("on");
    var i = document.createElement("iframe"); i.src = emb; i.title = "Video de Instagram"; i.allow = "autoplay; encrypted-media; picture-in-picture"; i.setAttribute("allowfullscreen", ""); i.loading = "lazy";
    b.appendChild(i);
  });

  // Botones «Cotizar» y filtros de servicios
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    var f = ev.target.closest("[data-scat]");
    if (f) { filtroS = f.getAttribute("data-scat"); document.querySelectorAll("#s-filtros .chip").forEach(function (c) { c.classList.toggle("on", c.getAttribute("data-scat") === filtroS); }); dibujarServicios(); return; }
    var a = ev.target.closest("#s-lista [data-s]");
    if (!a) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    abrirWA("Hola, vi su página web y quiero cotizar: " + a.getAttribute("data-s"));
  }, true);

  /* ---------- tienda ---------- */
  var productos = [], carro = {}, filtro = "Todos";
  try { carro = JSON.parse(localStorage.getItem("tecnifem-carro") || "{}") || {}; } catch (e) { carro = {}; }
  function guardar() { try { localStorage.setItem("tecnifem-carro", JSON.stringify(carro)); } catch (e) {} }
  function prod(id) { for (var i = 0; i < productos.length; i++) if (productos[i].id === id) return productos[i]; return null; }
  function cantidad() { var c = 0; for (var k in carro) c += carro[k]; return c; }
  function total() { var t = 0; for (var k in carro) { var p = prod(k); if (p) t += p.precio * carro[k]; } return t; }

  function pintarTienda(t, lista) {
    var sec = $("tienda");
    if (!sec) return;
    if (!t || t.activa === false) { sec.hidden = true; $("m-tienda").hidden = true; $("carro-btn").hidden = true; return; }
    sec.hidden = false; $("m-tienda").hidden = false; $("carro-btn").hidden = false;
    txt("t-titulo", t.titulo, true); txt("t-bajada", t.bajada); txt("t-entrega", t.entrega);
    var av = $("t-aviso"); if (av) { av.textContent = t.aviso_ejemplo || ""; av.hidden = !t.aviso_ejemplo; }
    // El carro se guarda por nombre del producto, así no se confunde si en el panel cambian el orden
    productos = (lista || []).filter(function (p) { return p && p.nombre; }).map(function (p) { return { id: String(p.nombre).trim(), nombre: p.nombre || "", categoria: p.categoria || "Otros", precio: Number(p.precio) || 0, antes: Number(p.precio_anterior) || 0, foto: p.foto || "", descripcion: p.descripcion || "", agotado: !!p.agotado, codigo: p.codigo || "", marca: p.marca || "", compatible: p.compatible || "" }; });
    // Si el panel cambió la lista, se limpia del carro lo que ya no existe o quedó sin precio
    for (var k in carro) { var p = prod(k); if (!p || p.agotado || !p.precio) delete carro[k]; }
    var cats = ["Todos"]; productos.forEach(function (p) { if (cats.indexOf(p.categoria) < 0) cats.push(p.categoria); });
    $("t-filtros").innerHTML = cats.length > 2 ? cats.map(function (c) { return '<button type="button" class="chip' + (c === filtro ? " on" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>"; }).join("") : "";
    var marcas = []; productos.forEach(function (p) { if (p.marca && marcas.indexOf(p.marca) < 0) marcas.push(p.marca); });
    var sm = $("t-marca");
    if (sm) { sm.hidden = !marcas.length; sm.innerHTML = '<option value="">Todas las marcas</option>' + marcas.sort().map(function (m) { return "<option>" + esc(m) + "</option>"; }).join(""); }
    pintarProductos(); pintarCarro();
  }

  function pintarProductos() {
    var g = $("t-grilla"); if (!g) return;
    var q = ($("t-buscar") && $("t-buscar").value || "").trim().toLowerCase(), mq = $("t-marca") ? $("t-marca").value : "";
    var vis = productos.filter(function (p) {
      if (filtro !== "Todos" && p.categoria !== filtro) return false;
      if (mq && p.marca !== mq) return false;
      if (q && (p.nombre + " " + p.descripcion + " " + p.codigo + " " + p.marca + " " + p.compatible).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (!vis.length) { g.innerHTML = '<p class="t-vacio">' + (q || mq ? "No encontramos productos con esa búsqueda. Escríbenos por WhatsApp y te ayudamos a encontrar el repuesto." : "Pronto agregaremos productos en esta categoría.") + "</p>"; return; }
    g.innerHTML = vis.map(function (p) {
      var foto = p.foto ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">' : '<div class="t-sinfoto"><svg aria-hidden="true"><use href="#i-caja"/></svg></div>';
      var oferta = p.precio && p.antes > p.precio;
      var precio = p.precio ? (oferta ? "<s>" + pesos(p.antes) + "</s> " : "") + pesos(p.precio) : "Precio por confirmar";
      var boton = p.agotado ? '<button type="button" class="btn btn-osc t-agregar" data-avisar="' + esc(p.id) + '">Avisarme cuando llegue</button>'
        : p.precio ? '<button type="button" class="btn btn-pri t-agregar" data-add="' + esc(p.id) + '">Agregar al carro</button>'
        : '<button type="button" class="btn btn-osc t-agregar" data-preg="' + esc(p.id) + '">Consultar precio</button>';
      var etiquetas = (p.agotado ? '<span class="t-badge agot">Agotado</span>' : oferta ? '<span class="t-badge oferta">-' + Math.round((1 - p.precio / p.antes) * 100) + "%</span>" : "");
      var meta = (p.marca ? '<span class="t-marca-tag">' + esc(p.marca) + "</span>" : "") + (p.codigo ? '<span class="t-cod">Cód. ' + esc(p.codigo) + "</span>" : "");
      return '<article class="t-prod' + (p.agotado ? " agotado" : "") + '"><div class="t-img">' + foto + etiquetas + '</div><div class="t-cuerpo"><span class="t-cat">' + esc(p.categoria) + "</span><h3>" + esc(p.nombre) + "</h3>" + (meta ? '<div class="t-meta">' + meta + "</div>" : "") + (p.compatible ? '<p class="t-compat"><b>Compatible con:</b> ' + esc(p.compatible) + "</p>" : "") + (p.descripcion ? "<p>" + esc(p.descripcion) + "</p>" : "") + '<b class="t-precio">' + precio + "</b>" + boton + "</div></article>";
    }).join("");
  }

  function pintarCarro() {
    var n = cantidad(); $("carro-n").textContent = n; $("carro-n").hidden = !n;
    var l = $("carro-lista"); if (!l) return;
    var ks = Object.keys(carro);
    if (!ks.length) { l.innerHTML = '<p class="t-vacio">Su carro está vacío.</p>'; }
    else l.innerHTML = ks.map(function (k) { var p = prod(k); return '<div class="c-item"><div><b>' + esc(p.nombre) + "</b><span>" + pesos(p.precio) + ' c/u</span></div><div class="c-cant"><button type="button" data-menos="' + esc(k) + '" aria-label="Quitar uno">−</button><span>' + carro[k] + '</span><button type="button" data-mas="' + esc(k) + '" aria-label="Agregar uno">+</button></div><b class="c-sub">' + pesos(p.precio * carro[k]) + "</b></div>"; }).join("");
    $("carro-total").textContent = pesos(total());
    $("carro-pagar").disabled = !ks.length;
  }

  function abrirCarro(si) { var d = $("carro"); d.classList.toggle("ver", si); d.setAttribute("aria-hidden", si ? "false" : "true"); if (si) $("carro-cerrar").focus(); }

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button,[data-cat]") : null; if (!b) return;
    if (b.dataset.cat !== undefined && b.dataset.cat !== "") { filtro = b.dataset.cat; document.querySelectorAll("#t-filtros .chip").forEach(function (c) { c.classList.toggle("on", c.dataset.cat === filtro); }); pintarProductos(); return; }
    if (b.dataset.add) { carro[b.dataset.add] = (carro[b.dataset.add] || 0) + 1; guardar(); pintarCarro(); b.textContent = "Agregado ✓"; setTimeout(function () { b.textContent = "Agregar al carro"; }, 1200); return; }
    if (b.dataset.avisar) { abrirWA("Hola, vi su tienda en la página web. ¿Me avisan cuando les llegue: " + prod(b.dataset.avisar).nombre + "?"); return; }
    if (b.dataset.preg) { abrirWA("Hola, vi su tienda en la página web y quiero saber el precio de: " + prod(b.dataset.preg).nombre); return; }
    if (b.dataset.mas) { carro[b.dataset.mas]++; guardar(); pintarCarro(); return; }
    if (b.dataset.menos) { if (--carro[b.dataset.menos] <= 0) delete carro[b.dataset.menos]; guardar(); pintarCarro(); return; }
    if (b.id === "carro-btn") { abrirCarro(true); return; }
    if (b.id === "carro-cerrar") { abrirCarro(false); return; }
  });
  $("carro") && $("carro").addEventListener("click", function (ev) { if (ev.target.id === "carro") abrirCarro(false); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && $("carro") && $("carro").classList.contains("ver")) abrirCarro(false); });

  var fPedido = $("carro-form");
  fPedido && fPedido.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ks = Object.keys(carro); if (!ks.length) return;
    var nombre = $("pd-nombre").value.trim(), entrega = $("pd-entrega").value, dir = $("pd-dir").value.trim(), av = $("pd-aviso");
    if (!nombre) { av.textContent = "Escriba su nombre."; return; }
    if (entrega === "Despacho a domicilio" && !dir) { av.textContent = "Escriba la dirección de despacho."; return; }
    av.textContent = "";
    if (PAGO_URL) {
      // Pago con Webpay por Flow: el servicio revisa los precios contra contenido/productos.json y devuelve el enlace de pago.
      fetch(PAGO_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: ks.map(function (k) { return { id: k, cantidad: carro[k] }; }), nombre: nombre, correo: ($("pd-correo") || {}).value || "", entrega: entrega, direccion: dir }) })
        .then(function (r) { return r.json(); }).then(function (r) { if (r.url) location.href = r.url; else throw 0; })
        .catch(function () { av.textContent = "No se pudo abrir el pago. Intente de nuevo o envíe el pedido por WhatsApp."; });
      return;
    }
    var lineas = ks.map(function (k) { var p = prod(k); return "• " + carro[k] + " x " + p.nombre + " (" + pesos(p.precio * carro[k]) + ")"; });
    abrirWA("Hola, soy " + nombre + ". Quiero hacer este pedido en la tienda de su página:\n" + lineas.join("\n") + "\nTotal productos: " + pesos(total()) + "\nEntrega: " + entrega + (dir ? " en " + dir : "") + ".");
  });
  var tb = $("t-buscar"); tb && tb.addEventListener("input", pintarProductos);
  var tm = $("t-marca"); tm && tm.addEventListener("change", pintarProductos);
  var selE = $("pd-entrega");
  selE && selE.addEventListener("change", function () { $("pd-dir-l").hidden = selE.value !== "Despacho a domicilio"; });

  /* ---------- carga ---------- */
  cargar("contenido/sitio.json").then(pintarTextos).catch(function () {});
  cargar("contenido/servicios.json").then(pintarServicios).catch(function () {});
  Promise.all([cargar("contenido/tienda.json"), cargar("contenido/productos.json")])
    .then(function (r) { pintarTienda(r[0], (r[1] && r[1].productos) || []); })
    .catch(function () { var s = $("tienda"); if (s) s.hidden = true; });
})();
