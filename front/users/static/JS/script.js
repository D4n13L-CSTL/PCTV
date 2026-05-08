// ---------- DATA MODEL (almacenado en localStorage) ----------
let requests = [];        // solicitudes registradas
let payments = [];       // pagos registrados (pueden estar asociados a una solicitud o pago directo)
let userProfile = {      // documentos subidos y datos personales
  fullName: "",
  idNumber: "",
  rif: "",
  email: "",
  uploadedDocs: []   // array de { name, fileUrl (simulado), uploadDate }
};

// Helper carga/save
function loadStorage() {
  const storedReqs = localStorage.getItem("ip_requests");
  const storedPayments = localStorage.getItem("ip_payments");
  const storedProfile = localStorage.getItem("ip_profile");
  if (storedReqs) requests = JSON.parse(storedReqs);
  if (storedPayments) payments = JSON.parse(storedPayments);
  if (storedProfile) userProfile = JSON.parse(storedProfile);
  else {
    // perfil demo vacío
    userProfile = { fullName: "", idNumber: "", rif: "", email: "", uploadedDocs: [] };
  }
}
function saveRequests() { localStorage.setItem("ip_requests", JSON.stringify(requests)); }
function savePayments() { localStorage.setItem("ip_payments", JSON.stringify(payments)); }
function saveProfile() { localStorage.setItem("ip_profile", JSON.stringify(userProfile)); }

// Estado de UI
let currentTab = "new";
let selectedReqType = "patente"; // patente, marca, derechoAutor, registroObra

// ---------- REQUISITOS DINÁMICOS según tipo (basado en documento) ----------
// Definimos grupos de campos especificos para cada tipo
// Pero también se contempla que cada tipo necesita documentos y datos específicos 
// Mostraremos Formulario dinámico basado en tipo + campos adicionales de requisitos.

// Mapeo de tipos a etiquetas y requisitos extra (además de datos del solicitante que se capturan globalmente)
const tipoInfo = {
  patente: { nombre: "Patente de Invención / Modelo", icono: "fa-microchip", fields: ["reseñaInvencion", "alcance"] },
  marca: { nombre: "Registro de Marca", icono: "fa-trademark", fields: ["nombresPosibles", "rubroMercado", "imagenUrl"] },
  derechoAutor: { nombre: "Derecho de Autor (Obra Literaria/Musical/Artes)", icono: "fa-copyright", fields: ["tipoObra", "descripcionObra"] },
  registroObra: { nombre: "Registro de Obra Específico (Audiovisual,Software,etc)", icono: "fa-film", fields: ["categoriaObra", "soporte"] }
};

// Requisitos documentales según el tipo de solicitante (persona natural, jurídica, estado). Parcialmente simulamos con flexibilidad.
// En interfaz permitimos seleccionar tipo solicitante y subir docs representativos (documentos simplificados)
let currentApplicantType = "natural"; // natural, juridica, ente

// FUNCIÓN para generar el formulario de nueva solicitud (paso a paso simplificado pero cubriendo todos los requisitos clave según archivo)
function renderNewRequestForm() {
  const tipo = selectedReqType;
  const info = tipoInfo[tipo];
  return `
        <div class="space-y-6">
          <div class="flex flex-wrap justify-between items-center border-b pb-2">
            <h2 class="text-2xl font-semibold flex items-center gap-2"><i class="fas ${info.icono} text-indigo-500"></i> Nueva solicitud: ${info.nombre}</h2>
            <div class="flex gap-2">
              <select id="reqTypeSelect" class="border rounded-lg px-3 py-1.5 text-sm bg-gray-50">
                <option value="patente" ${tipo === 'patente' ? 'selected' : ''}>Patente</option>
                <option value="marca" ${tipo === 'marca' ? 'selected' : ''}>Marca</option>
                <option value="derechoAutor" ${tipo === 'derechoAutor' ? 'selected' : ''}>Derecho de Autor</option>
                <option value="registroObra" ${tipo === 'registroObra' ? 'selected' : ''}>Registro de Obra (audiovisual/software)</option>
              </select>
            </div>
          </div>
          
          <div class="grid md:grid-cols-2 gap-5">
            <!-- SOLICITANTE (DATOS COMUNES) -->
            <div class="bg-gray-50 p-4 rounded-xl border">
              <h3 class="font-semibold text-lg mb-3"><i class="fas fa-user-check text-green-700"></i> Datos del solicitante</h3>
              <label class="block text-sm font-medium">Tipo de solicitante</label>
              <select id="applicantType" class="w-full border rounded-lg p-2 mb-2">
                <option value="natural" ${currentApplicantType === 'natural' ? 'selected' : ''}>Persona Natural</option>
                <option value="juridica" ${currentApplicantType === 'juridica' ? 'selected' : ''}>Persona Jurídica (Sociedad)</option>
                <option value="ente" ${currentApplicantType === 'ente' ? 'selected' : ''}>Ente / Empresa del Estado</option>
              </select>
              <div class="space-y-2 mt-2">
                <input type="text" id="solicitanteNombre" placeholder="Nombre completo / Razón social" class="w-full border p-2 rounded">
                <input type="text" id="solicitanteId" placeholder="Cédula / RIF" class="w-full border p-2 rounded">
                <input type="text" id="representanteLegal" placeholder="Representante legal (si aplica)" class="w-full border p-2 rounded">
              </div>
              <div class="mt-3 text-xs text-gray-500">Según normativa SAPI: personería jurídica requiere acta constitutiva, etc. Adjuntar después.</div>
            </div>
            
            <!-- REQUISITOS ESPECÍFICOS DEL TIPO -->
            <div class="bg-gray-50 p-4 rounded-xl border">
              <h3 class="font-semibold text-lg mb-3"><i class="fas fa-clipboard-list text-blue-700"></i> Requisitos relativos al producto/obra</h3>
              <div id="dynamicReqFields" class="space-y-3"></div>
              <div class="mt-3 text-xs text-gray-500">* Documentación adicional según Ley de Propiedad Industrial / Derecho de Autor.</div>
            </div>
          </div>
          
          <!-- DOCUMENTOS LEGALES ADICIONALES (simulador de carga de PDF / imagen) - basado en el archivo: apoderados, cesión de inventores, etc -->
          <div class="border-t pt-4">
            <h3 class="font-semibold text-md flex gap-2"><i class="fas fa-file-alt text-red-600"></i> Anexos requeridos (según tipo y solicitante)</h3>
            <div class="grid sm:grid-cols-2 gap-3 mt-2" id="legalDocsContainer">
              <!-- Documentos dinámicos: se llenarán según tipo de solicitante y tipo IP -->
            </div>
          </div>
          
          <!-- MONTO A PAGAR -->
          <div class="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <label class="block font-semibold text-gray-800"><i class="fas fa-dollar-sign text-amber-600"></i> Monto a pagar por esta solicitud (USD / Moneda local)</label>
            <div class="flex gap-3 items-center mt-1">
              <input type="number" id="montoSolicitud" placeholder="Ej: 125,00" step="0.01" class="border rounded-lg p-2 w-48">
              <span class="text-sm text-gray-500">+ tasas administrativas SAPI</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">* El monto incluye búsqueda avanzada, publicaciones y derecho de título según corresponda.</p>
          </div>
          
          <div class="flex justify-end gap-3">
            <button id="saveRequestBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md font-semibold"><i class="fas fa-save"></i> Registrar solicitud y generar pago pendiente</button>
          </div>
        </div>
      `;
}

// Llenar campos dinámicos según tipo (patente, marca, etc.)
function populateDynamicFields(tipo) {
  const container = document.getElementById("dynamicReqFields");
  if (!container) return;
  let html = '';
  if (tipo === 'patente') {
    html = `<label class="block text-sm font-semibold">Reseña y alcance de la invención</label>
                <textarea id="reseña" rows="2" class="w-full border rounded p-2" placeholder="Describir resumen técnico..."></textarea>
                <label class="block text-sm font-semibold mt-2">Alcance / reivindicaciones clave</label>
                <textarea id="alcance" rows="2" class="w-full border rounded p-2" placeholder="Campo de protección..."></textarea>`;
  } else if (tipo === 'marca') {
    html = `<label class="block text-sm font-semibold">3 posibles nombres (separados por comas)</label>
                <input id="nombresMarca" class="w-full border rounded p-2" placeholder="Ej: ECOVERDE, VERDECO, NATURGREEN">
                <label class="block text-sm font-semibold mt-2">Rubros / mercados impactados</label>
                <textarea id="rubros" rows="2" class="w-full border rounded p-2" placeholder="Clases Niza, productos o servicios..."></textarea>
                <label class="block text-sm font-semibold mt-2">Imagen (isotipo / logotipo) - URL o referencia</label>
                <input id="imagenMarca" placeholder="subir mockup / nombre archivo" class="w-full border rounded p-2">`;
  } else if (tipo === 'derechoAutor') {
    html = `<label class="block text-sm font-semibold">Tipo de obra literaria, musical o artística</label>
                <select id="tipoObraSelect" class="w-full border rounded p-2"><option>Literaria</option><option>Musical (máx 25 canciones)</option><option>Arte visual</option><option>Producción fonográfica</option></select>
                <label class="block text-sm font-semibold mt-2">Descripción / título de la obra</label>
                <textarea id="descObra" rows="2" class="w-full border rounded p-2" placeholder="Título, fecha de creación, géneros..."></textarea>`;
  } else if (tipo === 'registroObra') {
    html = `<label class="block text-sm font-semibold">Categoría de obra</label>
                <select id="catObra" class="w-full border rounded p-2"><option>Obra Audiovisual</option><option>Programa de Computación/Software</option><option>Base de Datos</option><option>Obra Radiofónica</option></select>
                <label class="block text-sm font-semibold mt-2">Soporte / formato (CD, PDF, MP3, etc)</label>
                <input id="soporteObra" placeholder="Ej: 2 CD + código fuente primeras/ultimas páginas" class="w-full border rounded p-2">
                <p class="text-xs text-gray-500 mt-1">Según requisitos: Manual de usuario, capturas de pantalla, etc. entregar en digital.</p>`;
  }
  container.innerHTML = html;
}

// Documentos legales dinámicos según solicitante y tipo (simulando carga de archivos)
function populateLegalDocs(applicantType, ipType) {
  const container = document.getElementById("legalDocsContainer");
  if (!container) return;
  let docs = [];
  // Basado en el flujograma y requisitos del documento
  if (applicantType === 'natural') {
    docs.push({ label: "Copia Cédula/ Pasaporte (PDF o imagen)", required: true });
    docs.push({ label: "RIF del solicitante (simple)", required: true });
    if (ipType === 'patente' || ipType === 'marca') docs.push({ label: "Declaración de cesión de inventores / declaración jurada", required: true });
    docs.push({ label: "Poder autenticado (si apoderado, opcional)", required: false });
  } else if (applicantType === 'juridica') {
    docs.push({ label: "Acta constitutiva (copia simple)", required: true });
    docs.push({ label: "Última acta de asamblea (si >5 años)", required: false });
    docs.push({ label: "RIF Sociedad vigente", required: true });
    docs.push({ label: "Cédula Representante Legal + RIF", required: true });
    docs.push({ label: "Poder autenticado (apoderado en SAPI)", required: false });
    docs.push({ label: "Documento de cesión de derechos patrimoniales / inventores", required: true });
  } else if (applicantType === 'ente') {
    docs.push({ label: "Copia simple de la Gaceta Oficial donde se publicó el Decreto o La Ley de creación", required: true });
    docs.push({ label: "Copia simple de la Gaceta Oficial donde se publicó el Acta Constitutiva en caso de Sociedades Anónimas o Fundaciones del Estado (Si Aplica)", required: true });
    docs.push({ label: "Copia Simple de la Gaceta Oficial en donde aparezca publicado el Nombramiento del Representante Legal para entes del Estado", required: true });
    docs.push({ label: "Si la Sociedad Anónima tiene más de cinco (5) años de creada, copia simple de la última acta de asamblea.", required: true });
    docs.push({ label: "Copia simple de la Cédula de Identidad o en su defecto copia simple del pasaporte del representante legal", required: false });
  }
  // adicionales para derecho de autor o registro obra
  if (ipType === 'derechoAutor' || ipType === 'registroObra') {
    docs.push({ label: "Cesión de derechos patrimoniales (autor a solicitante)", required: true });
    docs.push({ label: "2 ejemplares digitales de la obra (CD/PDF/mp3)", required: true });
  }
  if (ipType === 'patente') docs.push({ label: "Memoria descriptiva (asesoría - no redacta parque)", required: true });
  if (ipType === 'marca') docs.push({ label: "Búsqueda fonética/gráfica (recomendado)", required: false });

  container.innerHTML = docs.map(d => `
        <div class="flex items-center gap-2 bg-white p-2 rounded border text-sm">
          <i class="fas fa-paperclip text-gray-500"></i>
          <span class="flex-1">${d.label} ${d.required ? '<span class="text-red-500">*</span>' : '(opcional)'}</span>
          <input type="file" class="text-xs file-input-doc" data-docname="${d.label}" accept=".pdf,.jpg,.png">
        </div>
      `).join('');
}

// ---------- DASHBOARD: listado de solicitudes realizadas con estado de pago ----------
function renderDashboard() {
  if (requests.length === 0) {
    return `<div class="text-center py-12"><i class="fas fa-folder-open text-5xl text-gray-300"></i><p class="mt-2 text-gray-500">No hay solicitudes registradas aún. Comienza una nueva.</p></div>`;
  }
  return `
        <h2 class="text-2xl font-bold mb-4"><i class="fas fa-chart-simple"></i> Mis solicitudes de Propiedad Intelectual</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border rounded-xl shadow">
            <thead class="bg-gray-100">
              <tr><th class="p-3 text-left">ID</th><th class="p-3 text-left">Tipo</th><th class="p-3 text-left">Solicitante</th><th class="p-3 text-left">Monto</th><th class="p-3 text-left">Estado Pago</th><th class="p-3 text-left">Fecha</th><th class="p-3 text-left">Acción</th></tr>
            </thead>
            <tbody>
              ${requests.map((req, idx) => {
    const pagoRel = payments.find(p => p.requestId === req.id) || null;
    const statusPay = pagoRel ? (pagoRel.pagado ? "Pagado ✅" : "Pendiente") : "Sin registrar pago";
    return `<tr class="border-b hover:bg-gray-50">
                  <td class="p-2">${req.id}</td>
                  <td class="p-2">${tipoInfo[req.tipo]?.nombre || req.tipo}</td>
                  <td class="p-2">${req.solicitanteNombre || 'N/A'}</td>
                  <td class="p-2">$${req.monto}</td>
                  <td class="p-2"><span class="px-2 py-1 rounded-full text-xs ${statusPay === 'Pagado ✅' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${statusPay}</span></td>
                  <td class="p-2">${new Date(req.fecha).toLocaleDateString()}</td>
                  <td class="p-2"><button onclick="window.pagarSolicitud('${req.id}')" class="text-indigo-600 text-sm underline">Registrar Pago</button></td>
                </tr>`;
  }).join('')}
            </tbody>
          </table>
        </div>
        <div class="mt-4 text-sm text-gray-500">* Para cada solicitud pendiente, puede registrar el pago asociado.</div>
      `;
}

// Vista Pagos realizados
function renderPaymentsView() {
  if (payments.length === 0) return `<div class="text-center py-12"><i class="fas fa-receipt text-4xl text-gray-300"></i><p>No hay pagos registrados.</p></div>`;
  return `
        <h2 class="text-2xl font-bold mb-4"><i class="fas fa-credit-card"></i> Historial de pagos</h2>
        <div class="grid gap-4 md:grid-cols-2">
          ${payments.map(p => `
            <div class="border rounded-xl p-4 shadow-sm bg-white">
              <div class="flex justify-between"><span class="font-bold">Solicitud ID: ${p.requestId || 'Pago directo'}</span><span class="text-green-600 font-semibold">${p.pagado ? 'Completado' : 'Pendiente'}</span></div>
              <div>Monto: $${p.monto}</div>
              <div>Fecha pago: ${new Date(p.fechaPago).toLocaleString()}</div>
              <div>Método: ${p.metodo || 'Transferencia / Depósito'}</div>
              <div class="text-xs text-gray-500">Comprobante: ${p.comprobante || 'Subido digitalmente'}</div>
            </div>
          `).join('')}
        </div>
      `;
}

// perfil con subida de documentos personales
function renderProfileView() {
  return `
        <div class="grid md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-5">
            <div class="border rounded-xl p-5">
              <h2 class="text-xl font-semibold mb-3"><i class="fas fa-id-card"></i> Datos personales (verificación de identidad)</h2>
              <div class="grid sm:grid-cols-2 gap-3">
                <input type="text" id="profileFullName" placeholder="Nombre completo" value="${escapeHtml(userProfile.fullName)}" class="border p-2 rounded">
                <input type="text" id="profileIdNumber" placeholder="Cédula / Pasaporte" value="${escapeHtml(userProfile.idNumber)}" class="border p-2 rounded">
                <input type="text" id="profileRif" placeholder="RIF" value="${escapeHtml(userProfile.rif)}" class="border p-2 rounded">
                <input type="email" id="profileEmail" placeholder="Correo electrónico" value="${escapeHtml(userProfile.email)}" class="border p-2 rounded">
              </div>
              <button id="saveProfileBtn" class="mt-3 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg">Guardar datos</button>
            </div>
            <div class="border rounded-xl p-5">
              <h3 class="font-semibold"><i class="fas fa-upload"></i> Documentos para verificación (según requisitos app)</h3>
              <p class="text-sm text-gray-500">Suba copia de cédula, RIF, poder si aplica</p>
              <div id="profileDocsList" class="my-3 space-y-2"></div>
              <div class="flex gap-2 mt-2"><input type="file" id="newDocUpload" accept=".pdf,.jpg,.png"><button id="uploadDocBtn" class="bg-gray-200 px-3 py-1 rounded">Agregar documento</button></div>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border">
            <h3 class="font-bold">Requisitos verificación app</h3>
            <ul class="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Cédula o pasaporte vigente</li>
              <li>RIF del solicitante</li>
              <li>Poder autenticado (si apoderado)</li>
              <li>Acta constitutiva o Gaceta (personería jurídica)</li>
            </ul>
            <div class="mt-4 text-xs text-gray-600">Documentos subidos: ${userProfile.uploadedDocs.length} archivo(s) registrados.</div>
          </div>
        </div>
      `;
}

function refreshProfileDocsList() {
  const container = document.getElementById("profileDocsList");
  if (container) {
    container.innerHTML = userProfile.uploadedDocs.map(doc => `<div class="flex justify-between text-sm border-b py-1"><span>📄 ${doc.name}</span><span class="text-gray-500">${new Date(doc.uploadDate).toLocaleDateString()}</span></div>`).join('');
  }
}

// Funciones auxiliares
function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function (m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }

// Registrar solicitud
function registerRequest() {
  const tipo = selectedReqType;
  const applicantType = document.getElementById("applicantType")?.value || "natural";
  const nombre = document.getElementById("solicitanteNombre")?.value || "Anónimo";
  const idDoc = document.getElementById("solicitanteId")?.value || "";
  const representante = document.getElementById("representanteLegal")?.value || "";
  let monto = parseFloat(document.getElementById("montoSolicitud")?.value);
  if (isNaN(monto)) monto = 0.00;
  // campos específicos según tipo
  let extraData = {};
  if (tipo === 'patente') {
    extraData = { reseña: document.getElementById("reseña")?.value, alcance: document.getElementById("alcance")?.value };
  } else if (tipo === 'marca') {
    extraData = { nombres: document.getElementById("nombresMarca")?.value, rubros: document.getElementById("rubros")?.value, imagenUrl: document.getElementById("imagenMarca")?.value };
  } else if (tipo === 'derechoAutor') {
    extraData = { tipoObra: document.getElementById("tipoObraSelect")?.value, descripcion: document.getElementById("descObra")?.value };
  } else if (tipo === 'registroObra') {
    extraData = { categoria: document.getElementById("catObra")?.value, soporte: document.getElementById("soporteObra")?.value };
  }
  const newId = "SOL-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const newRequest = {
    id: newId, tipo: tipo, solicitanteNombre: nombre, solicitanteId: idDoc, representanteLegal: representante,
    monto: monto, applicantType: applicantType, fecha: new Date().toISOString(), extra: extraData, estadoPago: "pendiente"
  };
  requests.push(newRequest);
  saveRequests();
  // Opcional: crear un registro de pago pendiente automático? solo si monto >0
  if (monto > 0) {
    const pendingPay = { id: "PAY-" + Date.now(), requestId: newId, monto: monto, pagado: false, fechaPago: new Date().toISOString(), metodo: "Pendiente", comprobante: "" };
    payments.push(pendingPay);
    savePayments();
  }
  alert(`Solicitud ${newId} registrada exitosamente. Monto: $${monto} (pago pendiente en vista Pagos).`);
  currentTab = "dashboard";
  renderCurrentView();
}

window.pagarSolicitud = (requestId) => {
  const solicitud = requests.find(r => r.id === requestId);
  if (!solicitud) return;
  let montoPagar = solicitud.monto;
  let nuevoPago = prompt(`Ingrese el monto a pagar para la solicitud ${requestId} ($${montoPagar})`, montoPagar);
  if (nuevoPago !== null && !isNaN(parseFloat(nuevoPago))) {
    const payId = "PAY-" + Date.now();
    payments.push({ id: payId, requestId: requestId, monto: parseFloat(nuevoPago), pagado: true, fechaPago: new Date().toISOString(), metodo: "Transferencia", comprobante: "Recibo manual" });
    savePayments();
    alert("Pago registrado exitosamente.");
    renderCurrentView();
  }
};

function renderCurrentView() {
  const container = document.getElementById("viewContainer");
  if (currentTab === "new") {
    container.innerHTML = renderNewRequestForm();
    document.getElementById("reqTypeSelect")?.addEventListener("change", (e) => { selectedReqType = e.target.value; renderCurrentView(); });
    document.getElementById("applicantType")?.addEventListener("change", (e) => { currentApplicantType = e.target.value; populateLegalDocs(currentApplicantType, selectedReqType); });
    populateDynamicFields(selectedReqType);
    populateLegalDocs(currentApplicantType, selectedReqType);
    document.getElementById("saveRequestBtn")?.addEventListener("click", registerRequest);
    document.getElementById("reqTypeSelect")?.dispatchEvent(new Event("change"));
  } else if (currentTab === "dashboard") {
    container.innerHTML = renderDashboard();
  } else if (currentTab === "payments") {
    container.innerHTML = renderPaymentsView();
  } else if (currentTab === "profile") {
    container.innerHTML = renderProfileView();
    refreshProfileDocsList();
    document.getElementById("saveProfileBtn")?.addEventListener("click", () => {
      userProfile.fullName = document.getElementById("profileFullName")?.value || "";
      userProfile.idNumber = document.getElementById("profileIdNumber")?.value || "";
      userProfile.rif = document.getElementById("profileRif")?.value || "";
      userProfile.email = document.getElementById("profileEmail")?.value || "";
      saveProfile();
      alert("Perfil guardado");
    });
    document.getElementById("uploadDocBtn")?.addEventListener("click", () => {
      const fileInput = document.getElementById("newDocUpload");
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        userProfile.uploadedDocs.push({ name: file.name, fileUrl: URL.createObjectURL(file), uploadDate: new Date().toISOString() });
        console.log(file);

        saveProfile();
        refreshProfileDocsList();
        alert("Documento agregado para verificación");
      } else alert("Seleccione un archivo.");
    });
  } else if (currentTab === 'logout') {
    container.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20">
            <i class="fas fa-spinner fa-spin text-3xl text-indigo-600 mb-4"></i>
            <p class="text-gray-600">Cerrando sesión de forma segura...</p>
          </div>
        `;
    performLogout();
  }
}

// Eventos tabs
function bindTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tab = btn.getAttribute("data-tab");
      if (tab) { currentTab = tab; renderCurrentView(); }
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("bg-indigo-600", "text-white"));
      btn.classList.add("bg-indigo-600", "text-white");
      btn.classList.remove("text-gray-700");
    });
  });
}

loadStorage();
renderCurrentView();
bindTabs();
// inicializar valores por defecto en currentApplicantType
// Función para cerrar sesión integrada con Django JWT
async function performLogout() {
  const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Ajusta según tu config
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  // 1. Intentar avisar al servidor para invalidar el refresh token
  if (accessToken && refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
    } catch (error) {
      console.warn("No se pudo invalidar en el servidor, procediendo con borrado local.");
    }
  }

  // 2. Limpiar todo el almacenamiento relacionado con la app
  const keysToRemove = [
    "access_token", "refresh_token", "currentUser",
    "ip_requests", "ip_payments", "ip_profile"
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  sessionStorage.clear();

  // 3. Feedback visual y redirección
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'info',
      title: 'Sesión terminada',
      text: 'Esperamos verte pronto',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = '/'; // Redirige al login (ajusta la ruta si es necesario)
    });
  } else {

    window.location.href = '/';
  }
}




window.renderCurrentView = renderCurrentView;