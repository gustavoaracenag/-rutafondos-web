import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// RutaFondos v3 — Orientador de financiamiento · Chile 2026
// Segmentación fina: etapa, sector, perfil, ventas, edad, deudas
// Motor de elegibilidad determinista (mismo ADN que AccesoJusto)
// ─────────────────────────────────────────────────────────────

const PALETTE = {
  ink: "#1E2430",
  coral: "#E8543F",
  amber: "#F2A61D",
  green: "#2E8B57",
  paper: "#F6F5F2",
  gray: "#8A93A6",
  purple: "#7A4FBF",
};

// ── Versión y curaduría ──────────────────────────────────────
// Actualiza estos dos valores cada vez que cambies la base de fondos.
const VERSION = {
  label: "v4.0",
  fecha: "10 de septiembre de 2026",
  nota: "Corrección de motor de elegibilidad (FOSIS, Startup Ciencia, Desafío Emprendedor, Impulso Chileno) + 2 instrumentos nuevos",
};

// ── Preguntas del motor ──────────────────────────────────────
const QUESTIONS = [
  {
    id: "edad",
    label: "Para empezar",
    text: "¿Cuál es tu edad?",
    help: "Los fondos exigen ser mayor de 18, y hay programas especiales para emprendedores senior desde los 50 años.",
    options: [
      { value: "menor18", label: "Menos de 18 años" },
      { value: "18a49", label: "Entre 18 y 49 años" },
      { value: "50mas", label: "50 años o más" },
    ],
  },
  {
    id: "etapa",
    label: "Tu etapa",
    text: "¿En qué etapa está tu emprendimiento?",
    help: "Esto define qué instituciones pueden apoyarte: cada fondo apunta a una etapa distinta.",
    options: [
      { value: "idea", label: "Solo tengo una idea", sub: "Aún no vendo nada" },
      { value: "informal", label: "Vendo, pero sin formalizar", sub: "No tengo inicio de actividades en el SII" },
      { value: "formal", label: "Empresa formalizada y con ventas", sub: "Con inicio de actividades en 1ª categoría" },
    ],
  },
  {
    id: "sector",
    label: "Tu rubro",
    text: "¿En qué sector está tu proyecto?",
    help: "Algunos sectores tienen fondos exclusivos (agro, cultura, ciencia) además de los generales.",
    options: [
      { value: "tradicional", label: "Comercio, servicios o manufactura", sub: "Almacén, gastronomía, belleza, talleres, tiendas, etc." },
      { value: "agro", label: "Agrícola o rural", sub: "Cultivos, ganadería, apicultura, turismo rural" },
      { value: "cultura", label: "Cultural, artístico o creativo", sub: "Artes, artesanía, diseño, patrimonio, audiovisual" },
      { value: "ciencia", label: "Base científico-tecnológica", sub: "Nace de investigación y desarrollo (I+D)" },
      { value: "otro", label: "Otro / no calza en los anteriores" },
    ],
  },
  {
    id: "perfil",
    label: "Tu perfil",
    text: "¿Alguno de estos perfiles te describe?",
    help: "Hay concursos exclusivos para estudiantes de educación superior y para el mundo técnico-profesional.",
    options: [
      { value: "universitario", label: "Estudiante de educación superior", sub: "Cursando estudios actualmente (Chile o Latinoamérica) — es el requisito de Jump Chile" },
      { value: "tp", label: "Estudiante, egresado/a o titulado/a de IP o CFT", sub: "Instituto Profesional o Centro de Formación Técnica" },
      { value: "ninguno", label: "Ninguno de los anteriores" },
    ],
  },
  {
    id: "mujer",
    label: "Foco de género",
    text: "¿El emprendimiento es liderado por una mujer?",
    help: "Varios fondos tienen líneas exclusivas o montos mayores para emprendimientos liderados por mujeres.",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "rubroMasc",
    label: "Tu rubro",
    text: "¿Tu rubro es de aquellos con mayor presencia masculina?",
    help: "Por ejemplo: minería, construcción, transporte, automotriz o telecomunicaciones.",
    showIf: (a) => a.mujer === "si" && a.etapa !== "formal",
    options: [
      { value: "si", label: "Sí, es un rubro masculinizado" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "innovador",
    label: "Tipo de proyecto",
    text: "¿Tu proyecto es innovador y escalable?",
    help: "Corfo entiende por esto una solución claramente distinta a lo que existe, con potencial de crecer rápido. Un negocio tradicional —almacén, servicios locales, gastronomía— normalmente no califica aquí, pero sí en Sercotec, FOSIS y los concursos privados.",
    options: [
      { value: "si", label: "Sí, innovador y escalable" },
      { value: "no", label: "No, es un negocio tradicional" },
      { value: "nose", label: "No estoy seguro/a" },
    ],
  },
  {
    id: "ventas",
    label: "Tus ventas",
    text: "¿En qué rango están tus ventas netas anuales?",
    help: "1 UF ≈ $39.000. 150 UF ≈ $5,9 millones al año; 5.000 UF ≈ $196 millones. Este dato define concursos privados como Impulso Chileno.",
    showIf: (a) => a.etapa === "formal",
    options: [
      { value: "menos150", label: "Menos de 150 UF al año", sub: "Menos de ~$6 millones" },
      { value: "150a5000", label: "Entre 150 y 5.000 UF", sub: "Entre ~$6 y ~$196 millones" },
      { value: "mas5000", label: "Más de 5.000 UF", sub: "Más de ~$196 millones" },
      { value: "nose", label: "No lo tengo claro" },
    ],
  },
  {
    id: "deudas",
    label: "Tu situación",
    text: "¿Tienes deudas laborales, previsionales o tributarias, o figuras en el Registro de Deudores de Pensiones de Alimentos?",
    help: "Sercotec lo exige como requisito de admisibilidad. Es mejor saberlo antes de postular.",
    showIf: (a) => a.etapa !== "formal",
    options: [
      { value: "no", label: "No, estoy al día" },
      { value: "si", label: "Sí, tengo deudas pendientes" },
      { value: "nose", label: "No estoy seguro/a" },
    ],
  },
  {
    id: "rsh",
    label: "Registro Social",
    text: "¿En qué tramo estás según el Registro Social de Hogares?",
    help: "Los programas FOSIS se dividen por tramo: la línea Semilla exige estar en el 40% más vulnerable. Puedes revisar el tuyo en registrosocial.gob.cl.",
    showIf: (a) => a.etapa !== "formal",
    options: [
      { value: "tramo40", label: "En el 40% más vulnerable", sub: "Tramos del 0% al 40%" },
      { value: "tramo60", label: "Entre el 41% y el 60%" },
      { value: "sobre60", label: "Sobre el 60%" },
      { value: "nose", label: "No lo sé" },
    ],
  },
];

// ── Helper: gate de deudas para fondos Sercotec ──────────────
const sercotecDeudasGate = (a, base) => {
  if (base.status !== "hoy") return base;
  if (a.deudas === "si") return { status: "paso", pending: "Regulariza tus deudas laborales, previsionales o tributarias (o tu situación en el Registro de Deudores de Pensiones de Alimentos): Sercotec lo verifica en la admisibilidad." };
  if (a.deudas === "nose") return { status: "paso", pending: "Confirma que no tienes deudas laborales, previsionales ni tributarias, y que no figuras en el Registro de Deudores de Pensiones de Alimentos. Sercotec lo verifica en la admisibilidad." };
  return base;
};

// ── Base de conocimiento (referencial 2026) ──────────────────
const FUNDS = [
  // ══ PÚBLICOS GENERALES ══
  {
    id: "fosis-semilla",
    name: "Emprendamos Semilla",
    inst: "FOSIS",
    type: "publico",
    amount: "Hasta $800.000",
    refundable: false,
    conv: "cerrada",
    url: "https://www.fosis.gob.cl/es/programas/autonomia-economica/emprendamos-semilla/",
    calendar: "Convocatoria 2026: 15 al 30 de abril (cerrada); resultados el 20 de mayo. FOSIS indica que pueden quedar cupos en algunos territorios — vale la pena consultar tu comuna.",
    what: "Capacitación, financiamiento para insumos o equipamiento, y acompañamiento para partir un negocio o trabajo independiente.",
    reqs: ["Mayor de 18 años", "Estar en el 40% más vulnerable según el Registro Social de Hogares, o participar en el Subsistema Seguridades y Oportunidades", "Tener una idea de negocio o un pequeño emprendimiento en funcionamiento", "Residir en una comuna donde se ejecute el programa", "Contar con ClaveÚnica"],
    route: [
      "Obtén tu ClaveÚnica si aún no la tienes (Registro Civil o ChileAtiende)",
      "Revisa tu tramo en registrosocial.gob.cl",
      "Postula en línea en fosis.gob.cl cuando abra la convocatoria de tu región",
      "Si quedas seleccionado/a: capacitación de unas 30 horas, luego plan de financiamiento y acompañamiento",
    ],
    evaluate: (a) => {
      if (a.etapa === "formal") return null;
      if (a.rsh === "tramo40") return { status: "hoy" };
      if (a.rsh === "tramo60") return { status: "paso", pending: "La línea Semilla exige estar en el 40% más vulnerable del Registro Social de Hogares. Con tu tramo (41–60%) puedes revisar el programa Emprendamos de FOSIS, dirigido a negocios ya en funcionamiento, en fosis.gob.cl." };
      if (a.rsh === "nose") return { status: "paso", pending: "Verifica tu tramo en registrosocial.gob.cl. Si estás dentro del 40% más vulnerable, puedes postular a esta línea." };
      return null;
    },
  },
  {
    id: "juntas-crecemos",
    name: "Taller Juntas Crecemos",
    inst: "PRODEMU",
    type: "publico",
    amount: "Formación + apoyo económico (monto no publicado)",
    refundable: false,
    conv: "cerrada",
    url: "https://miportalemprendimiento.gob.cl/programas/taller-juntas-crecemos",
    calendar: "Convocatoria 2026: cerró el 15 de mayo y el taller partió el 1 de junio. Suele repetirse anualmente en otoño, con cupos limitados por región.",
    what: "Taller de formación para mujeres con una idea de negocio o un emprendimiento en etapa inicial. Aborda contabilidad básica y marketing digital, con acompañamiento y apoyo económico para quienes completan las etapas del programa. Es presencial.",
    reqs: ["Ser mujer", "Tener una idea de emprendimiento o un negocio en etapa inicial", "Postular a través de Mi Portal de Emprendimiento con ClaveÚnica", "Disponibilidad para asistir presencialmente a la oficina regional o provincial de PRODEMU"],
    route: [
      "Ingresa con ClaveÚnica a miportalemprendimiento.gob.cl",
      "Selecciona el Taller Juntas Crecemos y completa el formulario de postulación",
      "Asiste a la convocatoria en tu oficina PRODEMU regional o provincial",
      "Espera la confirmación: los cupos son limitados y se asignan por región",
    ],
    evaluate: (a) => {
      if (a.mujer !== "si" || a.etapa === "formal") return null;
      return { status: "hoy" };
    },
  },
  {
    id: "sercotec-semilla",
    name: "Capital Semilla Emprende",
    inst: "Sercotec",
    type: "publico",
    amount: "$3.500.000",
    refundable: false,
    conv: "cerrada",
    url: "https://www.sercotec.cl/capital-semilla-emprende/",
    calendar: "Convocatoria 2026: 29 abr – 13 may (cerrada). Es anual y por región: la próxima debería abrir en torno a abril–mayo 2027.",
    what: "Cofinancia un plan de trabajo para crear y formalizar un nuevo negocio: gestión empresarial (hasta $500.000) e inversiones (hasta $3.000.000), con acompañamiento técnico. Subsidio neto (el IVA lo financia el beneficiario).",
    reqs: ["Mayor de 18 años", "NO tener inicio de actividades en 1ª categoría ante el SII", "Sin deudas laborales, previsionales ni tributarias, y no figurar en el Registro de Deudores de Pensiones de Alimentos", "Aporte propio de 3% del subsidio", "No haber recibido fondos Sercotec en los últimos 24 meses"],
    route: [
      "Regístrate como usuario/a en sercotec.cl",
      "Descarga y lee las bases de la convocatoria de tu región",
      "Completa el formulario: test de preselección + video pitch (ideal < 90 segundos) + documentos",
      "Postula con anticipación: la plataforma se satura los últimos días",
    ],
    evaluate: (a) => {
      if (a.etapa === "formal") return null;
      return sercotecDeudasGate(a, { status: "hoy" });
    },
  },
  {
    id: "sercotec-abeja",
    name: "Capital Abeja Emprende",
    inst: "Sercotec",
    type: "publico",
    amount: "$3.500.000",
    refundable: false,
    conv: "proxima",
    url: "https://www.sercotec.cl/programas/capital-abeja-emprende/",
    calendar: "Convocatoria anual por región, en fechas similares a Capital Semilla (otoño). Revisa el calendario de tu región en sercotec.cl.",
    what: "La versión de Capital Semilla exclusiva para mujeres: financia la creación y formalización de negocios liderados por emprendedoras, con acompañamiento técnico.",
    reqs: ["Ser mujer, mayor de 18 años", "Tener un emprendimiento o idea de emprendimiento", "NO tener inicio de actividades en 1ª categoría ante el SII"],
    route: [
      "Regístrate en sercotec.cl",
      "Revisa las bases regionales de Capital Abeja",
      "Postula en línea con tu plan de negocios",
      "Consejo: no puedes adjudicar Semilla y Abeja a la vez — elige la convocatoria con mejor calendario en tu región",
    ],
    evaluate: (a) => {
      if (a.mujer !== "si" || a.etapa === "formal") return null;
      return sercotecDeudasGate(a, { status: "hoy" });
    },
  },
  {
    id: "sercotec-pioneras",
    name: "Capital Pioneras Emprende",
    inst: "Sercotec",
    type: "publico",
    amount: "$3.500.000",
    refundable: false,
    conv: "abierta",
    url: "https://www.sercotec.cl/postulaciones-abiertas/",
    calendar: "Convocatoria 2026: 1 al 15 de julio (15:00). En La Araucanía el plazo se amplió hasta el 24 de julio a las 12:00 — revisa si tu región también amplió en sercotec.cl.",
    what: "Apoya la puesta en marcha de negocios liderados por mujeres en rubros con mayor presencia masculina (construcción, manufactura, transporte, mantenimiento automotriz, tecnologías de la información, electricidad, entre otros). Del subsidio, entre $200.000 y $500.000 van a gestión empresarial y entre $3.000.000 y $3.300.000 a inversiones.",
    reqs: ["Ser mujer mayor de 18 años, con sexo registral femenino", "Sin inicio de actividades en 1ª categoría ante el SII", "Residir en la región de la convocatoria", "Proyecto en un rubro masculinizado según las bases", "Aporte empresarial del 3% del subsidio (~$105.000)", "Solo una postulación por persona"],
    route: [
      "Entra a sercotec.cl/postulaciones-abiertas y verifica el plazo de tu región",
      "Confirma en las bases que tu rubro califica como masculinizado",
      "Prepara el test de preselección, tu modelo de negocio (Canvas), un video pitch de máximo 90 segundos y el presupuesto",
      "Postula antes del cierre: considera que el IVA (~$684.950) no lo financia Sercotec",
    ],
    evaluate: (a) => {
      if (a.mujer !== "si" || a.etapa === "formal" || a.rubroMasc !== "si") return null;
      return sercotecDeudasGate(a, { status: "hoy" });
    },
  },
  {
    id: "sercotec-crece",
    name: "Fondo Crece",
    inst: "Sercotec",
    type: "publico",
    amount: "Hasta ~$5.000.000",
    refundable: false,
    conv: "proxima",
    url: "https://www.sercotec.cl/crece/",
    calendar: "Convocatorias por región durante el año, habitualmente entre abril y julio. Existe también la variante Crece Sostenible.",
    what: "Financia inversiones y acciones para potenciar el crecimiento de micro y pequeñas empresas ya formalizadas: maquinaria, infraestructura, marketing, gestión.",
    reqs: ["Empresa con inicio de actividades en 1ª categoría", "Ventas dentro de los tramos de micro o pequeña empresa (hasta 25.000 UF anuales)", "Requisitos específicos según bases regionales"],
    route: [
      "Regístrate en sercotec.cl",
      "Revisa las bases de la convocatoria Crece de tu región",
      "Postula con un plan de inversión con cotizaciones de respaldo",
    ],
    evaluate: (a) => {
      if (a.etapa === "formal") return { status: "hoy" };
      return { status: "despues", unlock: "Se desbloquea cuando formalices tu empresa ante el SII y registres ventas." };
    },
  },
  {
    id: "corfo-inicia",
    name: "Semilla Inicia",
    inst: "Corfo",
    type: "publico",
    amount: "Hasta $15.000.000 ($17M si es liderado por mujer)",
    refundable: false,
    conv: "proxima",
    url: "https://www.corfo.cl/sites/cpp/inf/semilla-inicia",
    calendar: "Llamados con calendario propio (no permanente). Revisa \"Convocatorias\" en corfo.cl durante todo el año.",
    what: "Subsidio para emprendimientos innovadores en etapa temprana (idea, diseño o prototipo, sin ventas regulares), con foco en reducir la brecha de acceso a capital de las emprendedoras.",
    reqs: ["Proyecto innovador: solución claramente distinta a lo existente", "Etapa temprana: sin ventas regulares", "Presupuesto con cotizaciones y plan de negocio con cliente específico identificado"],
    route: [
      "Revisa convocatorias vigentes en corfo.cl",
      "Prepara plan de negocio: problema, cliente, solución, diferenciación",
      "Cada gasto del presupuesto debe tener respaldo — los presupuestos sin cotizaciones son la causa más común de rechazo",
    ],
    evaluate: (a) => {
      if (a.etapa === "formal") return null;
      if (a.innovador === "si" || (a.innovador === "nose" && a.sector === "ciencia")) return { status: "hoy" };
      if (a.innovador === "nose") return { status: "paso", pending: "Valida si tu proyecto califica como innovador para Corfo: ¿tu solución es claramente distinta a lo que existe y puede escalar? Si es un negocio tradicional, tu ruta es Sercotec, FOSIS o los concursos privados." };
      return null;
    },
  },
  {
    id: "corfo-expande",
    name: "Semilla Expande",
    inst: "Corfo",
    type: "publico",
    amount: "Hasta $45.000.000 ($51M si es liderado por mujer)",
    refundable: false,
    conv: "cerrada",
    url: "https://www.corfo.cl/sites/cpp/emp-semilla-expande",
    calendar: "Convocatoria nacional 2026: 15 ene – 24 feb (cerrada). Hay llamados regionales durante el año; el nacional suele repetirse a inicios de año.",
    what: "Subsidio para emprendimientos innovadores que ya validaron su solución y tienen ventas iniciales, y necesitan capital para escalar. Se entrega en 2 etapas contra hitos.",
    reqs: ["Empresa formalizada y facturando con la solución que quiere escalar", "Innovación y escalabilidad demostrables", "Cofinanciamiento propio en efectivo: 25% (15% si es liderada por mujer)", "Nota mínima 3,0 en la evaluación"],
    route: [
      "Revisa el calendario en corfo.cl",
      "Prepara evidencia de tracción: ventas, clientes, métricas de crecimiento",
      "Considera que el subsidio cubre valores netos: el IVA sale de tu caja",
    ],
    evaluate: (a) => {
      if (a.etapa === "formal" && (a.innovador === "si" || (a.innovador === "nose" && a.sector === "ciencia"))) return { status: "hoy" };
      if (a.etapa === "formal" && a.innovador === "nose") return { status: "paso", pending: "Valida si tu empresa cumple el estándar de innovación y escalabilidad de Corfo antes de invertir tiempo en la postulación." };
      if (a.innovador === "si" || a.innovador === "nose") return { status: "despues", unlock: "Se desbloquea cuando tu empresa esté formalizada y tenga ventas iniciales con la solución que quieres escalar." };
      return null;
    },
  },
  {
    id: "startup-chile",
    name: "Start-Up Chile",
    inst: "Corfo",
    type: "publico",
    amount: "Hasta $75.000.000 (sin ceder acciones)",
    refundable: false,
    conv: "cerrada",
    url: "https://www.corfo.gob.cl/sites/cpp/programa/startup-chile/",
    calendar: "Generación BIG 12: postulaciones del 4 al 25 de mayo de 2026 (cerrada). Las convocatorias son anuales — revisa startupchile.org y corfo.cl.",
    what: "La aceleradora pública de Corfo, con tres líneas según la etapa de tu startup: Build (la más inicial), Ignite y Growth. Además del subsidio entrega aceleración intensiva, espacio de co-work, mentorías y conexión con el ecosistema. Abierta a startups de cualquier nacionalidad que usen Chile como plataforma.",
    reqs: ["Mayor de 18 años, fundador/a o socio/a de un proyecto de base tecnológica", "El proyecto debe usar Chile como plataforma de escalamiento global", "Build: hasta 12 meses desde el inicio de actividades — Ignite: hasta 36 meses", "Growth: entre 24 y 120 meses, con ventas de 2.400 a 25.000 UF en los últimos 12 meses", "Innovación, escalabilidad y potencial de impacto global"],
    route: [
      "Identifica qué línea te corresponde según la antigüedad de tu empresa: Build, Ignite o Growth",
      "Revisa las bases en startupchile.org y prepara tu pitch: problema, solución, tracción y potencial global",
      "Postula en línea en startupchile.org o corfo.cl cuando abra la convocatoria",
      "Si tu proyecto es liderado por una mujer: al menos el 50% de los seleccionados en Build deben serlo, y en Ignite y Growth accedes a mayor cofinanciamiento",
    ],
    evaluate: (a) => {
      if (a.innovador === "no") return null;
      if (a.innovador === "nose") return { status: "paso", pending: "Start-Up Chile exige base tecnológica y potencial de escalar globalmente. Valida si tu proyecto califica antes de invertir tiempo en la postulación." };
      return { status: "hoy" };
    },
  },
  {
    id: "fogape",
    name: "FOGAPE",
    inst: "BancoEstado / banca",
    type: "publico",
    amount: "Garantía estatal para créditos",
    refundable: true,
    conv: "abierta",
    url: "https://www.fogape.cl",
    calendar: "Disponible de forma permanente a través de los bancos adheridos.",
    what: "No es un fondo concursable: es una garantía del Estado que respalda tu crédito bancario cuando no tienes garantías propias suficientes. El crédito sí se paga.",
    reqs: ["Empresa formalizada con ventas", "Evaluación crediticia del banco"],
    route: [
      "Consulta en BancoEstado u otro banco adherido por créditos con garantía FOGAPE",
      "Compara tasas: es deuda, no subsidio — úsalo para capital de trabajo o inversión con retorno claro",
    ],
    evaluate: (a) => {
      if (a.etapa === "formal") return { status: "hoy" };
      return { status: "despues", unlock: "Disponible cuando tengas empresa formalizada con historial de ventas." };
    },
  },
  // ══ PÚBLICOS SECTORIALES ══
  {
    id: "indap",
    name: "Programas de fomento INDAP",
    inst: "INDAP · Min. Agricultura",
    type: "publico",
    amount: "Variable según programa",
    refundable: false,
    conv: "abierta",
    url: "https://www.indap.gob.cl",
    calendar: "Convocatorias durante todo el año, según programa y región.",
    what: "Para emprendimientos agrícolas y rurales: programas de inversión, riego, praderas, turismo rural y desarrollo de la agricultura familiar campesina.",
    reqs: ["Cumplir el perfil de usuario/a INDAP (pequeño productor agrícola o campesino)", "Requisitos específicos según programa"],
    route: [
      "Acércate a la agencia de área INDAP de tu comuna o revisa indap.gob.cl",
      "Acredita tu condición de usuario/a INDAP",
      "Postula al programa que calce con tu inversión (riego, equipamiento, turismo rural, etc.)",
    ],
    evaluate: (a) => {
      if (a.sector !== "agro") return null;
      return { status: "hoy" };
    },
  },
  {
    id: "fondart",
    name: "Fondos Cultura (Fondart)",
    inst: "Min. de las Culturas",
    type: "publico",
    amount: "Variable según línea de concurso",
    refundable: false,
    conv: "abierta",
    url: "https://www.fondosdecultura.cl",
    calendar: "Las convocatorias suelen abrir entre junio y agosto de cada año para el ciclo siguiente — es decir, ahora es buen momento para revisar.",
    what: "Para proyectos artísticos, culturales, de artesanía, diseño, arquitectura y patrimonio. Líneas de creación, difusión, circulación (nacional e internacional) y formación.",
    reqs: ["Registrarte en la plataforma Perfil Cultura", "Cumplir la línea de concurso pertinente a tu disciplina", "Cofinanciamiento obligatorio en algunas líneas"],
    route: [
      "Crea tu cuenta en Perfil Cultura (fondosdecultura.cl)",
      "Elige la línea de concurso pertinente a tu disciplina y lee sus bases",
      "Completa el Formulario Único de Postulación (FUP) con los documentos mínimos",
    ],
    evaluate: (a) => {
      if (a.sector !== "cultura") return null;
      return { status: "hoy" };
    },
  },
  {
    id: "startup-ciencia",
    name: "Startup Ciencia",
    inst: "ANID",
    type: "publico",
    amount: "Subsidio para I+D empresarial",
    refundable: false,
    conv: "proxima",
    url: "https://anid.cl/concursos/startup-ciencia-2027/",
    calendar: "Startup Ciencia 2027: apertura julio 2026, cierre septiembre 2026, fallo febrero 2027. ANID la marca como concurso próximo — revisa anid.cl para la fecha exacta de apertura.",
    what: "Para emprendimientos de base científico-tecnológica que nacen de investigación y desarrollo, con foco en llevar la ciencia al mercado.",
    reqs: ["Emprendimiento de base científico-tecnológica", "Componente real de I+D", "Requisitos de la convocatoria vigente"],
    route: [
      "Revisa el calendario de concursos en anid.cl",
      "Prepara la evidencia científico-técnica de tu solución",
      "Postula en la plataforma de ANID cuando abra el llamado",
    ],
    evaluate: (a) => {
      if (a.sector !== "ciencia") return null;
      return { status: "hoy" };
    },
  },
  // ══ PRIVADOS Y CONCURSOS ══
  {
    id: "impulso-chileno",
    name: "Impulso Chileno",
    inst: "Fundación Luksic",
    type: "privado",
    amount: "Hasta $5.000.000 (500 ganadores/año)",
    refundable: false,
    conv: "proxima",
    url: "https://www.fundacionluksic.cl/programas/impulso-chileno/",
    calendar: "Convocatoria anual: la edición 2025 postuló del 22 sep al 6 oct. La próxima debería abrir alrededor de septiembre 2026 — ¡queda poco!",
    what: "Programa privado que entrega capital, formación y acompañamiento a emprendedores formalizados de todo Chile. Incluye un diagnóstico en la plataforma La Brújula del Emprendedor.",
    reqs: ["Mayor de 18 años, chileno/a o extranjero/a con residencia definitiva", "Inicio de actividades en 1ª categoría (persona natural o jurídica)", "Ser dueño/a o socio/a mayoritario/a", "Ventas netas anuales entre 150 UF y 5.000 UF"],
    route: [
      "Sigue las redes y el sitio de Fundación Luksic para la apertura",
      "Completa el diagnóstico en La Brújula del Emprendedor",
      "Postula en línea dentro del plazo (suele ser una ventana corta, ~2 semanas)",
    ],
    evaluate: (a) => {
      if (a.etapa !== "formal") return { status: "despues", unlock: "Se desbloquea al formalizar tu empresa y superar 150 UF de ventas anuales." };
      if (a.ventas === "150a5000") return { status: "hoy" };
      if (a.ventas === "menos150") return { status: "paso", pending: "Tus ventas aún no alcanzan el mínimo de 150 UF anuales (~$6 millones). Cuando las superes, calzas perfecto con este programa." };
      if (a.ventas === "nose") return { status: "paso", pending: "Calcula tus ventas netas anuales: para postular deben estar entre 150 y 5.000 UF." };
      return null; // > 5.000 UF excede el tramo
    },
  },
  {
    id: "impulso-senior",
    name: "Impulso Senior",
    inst: "Fundación Luksic · Caja Los Andes",
    type: "privado",
    amount: "Máquina semi industrial o herramienta de digitalización",
    refundable: false,
    conv: "cerrada",
    url: "https://fundacionluksic.cl/que-hacemos/grandes/impulso-senior/",
    calendar: "Convocatoria 2026: 2 al 16 de marzo (cerrada); resultados notificados el 1 de junio. Suele repetirse anualmente en marzo.",
    what: "Programa para emprendedores/as de 50 años o más: entrega una máquina semi industrial o una herramienta de digitalización concreta para potenciar el negocio. Se ejecuta en alianza con Caja Los Andes.",
    reqs: ["Tener 50 años o más", "Negocio formalizado con funcionamiento periódico y constante", "Ventas mínimas de $100.000 mensuales en los últimos 3 meses", "Se puede postular un solo emprendimiento por persona"],
    route: [
      "Revisa las bases en fundacionluksic.cl o cajalosandes.cl",
      "Postula en línea en marzo y define la máquina o herramienta que necesitas (no se puede cambiar después)",
      "Si quedas preseleccionado/a, el equipo te contacta por teléfono para confirmar datos y evaluar el negocio",
    ],
    evaluate: (a) => {
      if (a.edad !== "50mas") return null;
      if (a.etapa === "formal") return { status: "hoy" };
      return { status: "despues", unlock: "Requiere negocio formalizado con ventas constantes de al menos $100.000 mensuales." };
    },
  },
  {
    id: "pyme2",
    name: "Fondo Pyme²",
    inst: "Abastible · ChileGlobal Ventures",
    type: "privado",
    amount: "Hasta $25.000.000 por startup",
    refundable: false,
    conv: "cerrada",
    url: "https://abastible.cl/nuestroproposito/fondopyme/",
    calendar: "Ciclo 2026: postulaciones cerraron el 15 de diciembre y los ganadores se anunciaron el 3 de marzo. Atento/a a la apertura de la próxima versión (fin de año).",
    what: "Fondo corporativo para startups cuya solución resuelva problemas transversales de las pymes chilenas. Financia un piloto de 3 meses en pymes reales (modalidad fondos rendibles), con acompañamiento de ChileGlobal Ventures y posible monto de escalamiento si el piloto evalúa bien.",
    reqs: ["Startup nacional o internacional con capacidad de implementar en Chile", "Solución dirigida a resolver barreras de crecimiento de pymes", "Criterios de selección: tracción, agilidad de implementación, equipo y grado de innovación"],
    route: [
      "Sigue los canales de Abastible y ChileGlobal Ventures (Fundación Chile) para la próxima convocatoria",
      "Prepara evidencia de tracción y un plan de piloto implementable en pymes en 3 meses",
      "El proceso final es un pitch ante jurado (Abastible, ChileGlobal Ventures, ASECH, Grande Pyme y Corfo)",
    ],
    evaluate: (a) => {
      if (a.innovador !== "si") return null;
      if (a.etapa === "idea") return { status: "paso", pending: "El fondo prioriza tracción demostrable: valida tu solución con primeros usuarios o pilotos antes de postular." };
      return { status: "hoy" };
    },
  },
  {
    id: "desafio-emprendedor",
    name: "Desafío Emprendedor",
    inst: "Banco de Chile",
    type: "privado",
    amount: "Premios en capital + formación",
    refundable: false,
    conv: "proxima",
    url: "https://sitiospublicos.bancochile.cl/desafio-emprendedor",
    calendar: "Concurso nacional anual (va en su 10ª versión). Postulación 100% online — revisa el sitio para la convocatoria vigente.",
    what: "Uno de los concursos privados más masivos de Chile: premia pymes y emprendimientos de todo el país con capital, capacitación y visibilidad.",
    reqs: ["Tener una pyme o emprendimiento en marcha", "Postulación online según bases de la versión vigente"],
    route: [
      "Entra al sitio del concurso y revisa si la convocatoria del año está abierta",
      "Prepara una buena descripción de tu negocio y su impacto",
    ],
    evaluate: (a) => {
      if (a.etapa === "idea") return { status: "despues", unlock: "Pensado para negocios en marcha: se desbloquea cuando empieces a vender." };
      return { status: "hoy" };
    },
  },
  {
    id: "chileconverge",
    name: "ChileConverge Emprende",
    inst: "Privado · mundo técnico-profesional",
    type: "privado",
    amount: "$50 millones en premios totales",
    refundable: false,
    conv: "cerrada",
    url: "https://premio.chileconverge.cl",
    calendar: "La edición 2026 cerró el 10 de enero. Atento/a a la apertura de la próxima versión (fin de año).",
    what: "Concurso para el talento técnico-profesional: premia pymes de estudiantes, egresados y titulados de IP y CFT, con foco territorial y de regiones.",
    reqs: ["Ser estudiante, egresado/a o titulado/a de Instituto Profesional o CFT", "Pyme o emprendimiento con al menos 1 año de operación demostrable"],
    route: [
      "Revisa las bases en premio.chileconverge.cl",
      "Prepara evidencia de tu año de operación y tu propuesta de valor",
      "Postula online cuando abra la convocatoria",
    ],
    evaluate: (a) => {
      if (a.perfil !== "tp") return null;
      if (a.etapa === "idea") return { status: "paso", pending: "Necesitas al menos 1 año de operación demostrable. Parte con FOSIS o Sercotec, y postula aquí cuando tu negocio tenga historial." };
      return { status: "hoy" };
    },
  },
  {
    id: "jump-chile",
    name: "Jump Chile",
    inst: "Universidad Católica",
    type: "privado",
    amount: "Premios en capital + aceleración",
    refundable: false,
    conv: "proxima",
    url: "https://www.jumpchile.com",
    calendar: "Convocatoria anual, habitualmente en el primer semestre.",
    what: "El concurso de emprendimiento universitario más grande de Chile y Latinoamérica: acepta desde ideas hasta proyectos en marcha de estudiantes de educación superior.",
    reqs: ["Ser estudiante de educación superior (Chile o Latinoamérica)", "Proyecto o idea de emprendimiento según bases de la versión"],
    route: [
      "Revisa las bases y fechas en jumpchile.com",
      "Arma tu equipo y describe el problema y tu solución",
      "Postula online — acepta proyectos en etapa de idea",
    ],
    evaluate: (a) => {
      if (a.perfil !== "universitario") return null;
      return { status: "hoy" };
    },
  },
];

// ── Recursos transversales (siempre visibles) ────────────────
const ALWAYS_RESOURCES = [
  {
    name: "Portal Único de Fondos Concursables",
    inst: "Estado de Chile",
    note: "El directorio maestro: concentra todos los fondos públicos por institución, categoría, estado (abierto / por abrir / cerrado) y región.",
    url: "https://www.fondos.gob.cl",
    calendar: "Actualización permanente",
  },
  {
    name: "Fondos regionales (GORE / FNDR)",
    inst: "Gobiernos Regionales",
    note: "Cada región abre líneas propias de fomento productivo. Revisa el sitio del Gobierno Regional de tu región.",
    url: "https://www.subdere.gov.cl/organizaci%C3%B3n/gobiernos-regionales",
    calendar: "Según calendario de cada GORE",
  },
];

// ── Estado de la convocatoria (curaduría verificada) ─────────
const ULTIMA_VERIFICACION = "23 de julio de 2026";

const CONV_META = {
  abierta: { label: "Convocatoria abierta", color: PALETTE.green, dot: "●" },
  proxima: { label: "Próxima a abrir", color: PALETTE.amber, dot: "◔" },
  cerrada: { label: "Convocatoria cerrada", color: PALETTE.gray, dot: "○" },
};

const STATUS_META = {
  hoy: { title: "Puedes postular", color: PALETTE.green, icon: "✓", desc: "Cumples los requisitos — revisa en el calendario si la convocatoria está abierta." },
  paso: { title: "Te falta un paso", color: PALETTE.amber, icon: "→", desc: "Estás cerca: resuelve lo pendiente y quedas habilitado/a." },
  despues: { title: "Se desbloquean más adelante", color: PALETTE.gray, icon: "◷", desc: "Tu ruta natural de crecimiento: así se ve tu siguiente etapa." },
};

// ─────────────────────────────────────────────────────────────
export default function RutaFondos() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(-1); // -1 = portada
  const [openCard, setOpenCard] = useState(null);

  const visibleQuestions = QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
  const done = step >= visibleQuestions.length && step !== 999;
  const isMinor = answers.edad === "menor18";

  const answer = (qid, value) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (qid === "edad" && value === "menor18") {
      setStep(999);
      return;
    }
    const nextVisible = QUESTIONS.filter((q) => !q.showIf || q.showIf(next));
    const idx = nextVisible.findIndex((q) => q.id === qid);
    setStep(idx + 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(-1);
    setOpenCard(null);
  };

  // Resultados del motor
  const results = { hoy: [], paso: [], despues: [] };
  if (done && !isMinor) {
    FUNDS.forEach((f) => {
      const r = f.evaluate(answers);
      if (r && r.status) results[r.status].push({ ...f, ...r });
    });
  }

  // ── UI helpers ──
  const Chip = ({ children, color }) => (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + "1A", color }}>
      {children}
    </span>
  );

  const CalendarLine = ({ text }) => (
    <div className="flex gap-2 items-start text-xs rounded-xl px-3 py-2" style={{ backgroundColor: PALETTE.ink + "08", color: "#4A5264" }}>
      <span className="shrink-0">🗓️</span>
      <span>{text}</span>
    </div>
  );

  const FundCard = ({ fund }) => {
    const open = openCard === fund.id;
    const meta = STATUS_META[fund.status];
    return (
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: meta.color + "55" }}>
        <button onClick={() => setOpenCard(open ? null : fund.id)} className="w-full text-left p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Chip color={fund.type === "privado" ? PALETTE.purple : PALETTE.coral}>{fund.inst}</Chip>
                <Chip color={PALETTE.gray}>{fund.type === "privado" ? "Privado" : "Público"}</Chip>
                {fund.refundable ? (
                  <Chip color={PALETTE.gray}>Se paga (crédito)</Chip>
                ) : (
                  <Chip color={PALETTE.green}>No se devuelve</Chip>
                )}
              </div>
              {fund.conv && CONV_META[fund.conv] && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px]" style={{ color: CONV_META[fund.conv].color }}>{CONV_META[fund.conv].dot}</span>
                  <span className="text-xs font-bold" style={{ color: CONV_META[fund.conv].color }}>
                    {CONV_META[fund.conv].label}
                  </span>
                </div>
              )}
              <h3 className="font-bold text-base" style={{ color: PALETTE.ink }}>{fund.name}</h3>
              <p className="text-sm font-semibold mt-0.5" style={{ color: meta.color }}>{fund.amount}</p>
            </div>
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-transform"
              style={{ backgroundColor: meta.color + "1A", color: meta.color, transform: open ? "rotate(90deg)" : "none" }}
            >
              ›
            </span>
          </div>
          {fund.pending && (
            <p className="mt-2 text-sm rounded-xl px-3 py-2" style={{ backgroundColor: PALETTE.amber + "15", color: "#8A6210" }}>
              <strong>Pendiente:</strong> {fund.pending}
            </p>
          )}
          {fund.unlock && <p className="mt-2 text-sm text-gray-500">{fund.unlock}</p>}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 text-sm" style={{ color: PALETTE.ink }}>
            <CalendarLine text={fund.calendar} />
            <p className="text-gray-600">{fund.what}</p>
            <div>
              <p className="font-semibold mb-1">Requisitos clave</p>
              <ul className="space-y-1">
                {fund.reqs.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: PALETTE.coral }}>•</span>
                    <span className="text-gray-600">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Tu ruta de postulación</p>
              <ol className="space-y-1.5">
                {fund.route.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className="shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                      style={{ backgroundColor: PALETTE.ink, color: "white" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-gray-600">{r}</span>
                  </li>
                ))}
              </ol>
            </div>
            <a
              href={fund.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{ backgroundColor: PALETTE.coral, color: "white" }}
            >
              Revisar sitio oficial ↗
            </a>
          </div>
        )}
      </div>
    );
  };

  // ── Pantallas ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.paper, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: `linear-gradient(135deg, ${PALETTE.coral}, ${PALETTE.amber})` }}
            >
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black leading-none text-lg tracking-tight" style={{ color: PALETTE.ink }}>RutaFondos</h1>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none"
                  style={{ backgroundColor: PALETTE.ink + "0F", color: PALETTE.gray }}
                  title={`Actualizado el ${VERSION.fecha}`}
                >
                  {VERSION.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-none mt-1">Financiamiento público y privado · Chile</p>
            </div>
          </div>
          {step >= 0 && (
            <button onClick={restart} className="text-xs font-semibold text-gray-400 hover:text-gray-600">Reiniciar</button>
          )}
        </header>

        {/* Portada */}
        {step === -1 && (
          <div className="space-y-5">
            <div className="rounded-3xl p-6 text-white" style={{ background: `linear-gradient(150deg, ${PALETTE.ink} 55%, #2B3446)` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: PALETTE.amber }}>
                Orientador de fondos concursables
              </p>
              <h2 className="text-2xl font-black leading-tight mb-3">
                Hay fondos públicos y privados para tu proyecto. El problema es saber cuál te corresponde.
              </h2>
              <p className="text-sm text-gray-300">
                Responde unas breves preguntas sobre tu etapa, rubro y perfil, y te mostramos <strong className="text-white">qué fondos calzan contigo</strong>, cuáles con <strong className="text-white">un paso más</strong>, y cuáles se desbloquean en tu siguiente etapa — con links oficiales y fechas de convocatoria.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: PALETTE.gray }}>
                Instituciones que cubrimos
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {["Sercotec", "Corfo", "FOSIS", "PRODEMU", "INDAP", "ANID", "Fondart", "FOGAPE"].map((inst) => (
                  <span key={inst} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: PALETTE.coral + "1A", color: PALETTE.coral }}>
                    {inst}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["F. Luksic", "Banco de Chile", "Abastible", "ChileConverge", "Jump Chile · UC"].map((inst) => (
                  <span key={inst} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: PALETTE.purple + "1A", color: PALETTE.purple }}>
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(0)}
              className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
              style={{ backgroundColor: PALETTE.coral }}
            >
              Encontrar mi fondo →
            </button>
            <p className="text-xs text-center text-gray-400">
              Gratis · Sin registro · Convocatorias verificadas al {VERSION.fecha}
            </p>
          </div>
        )}

        {/* Menor de edad */}
        {isMinor && step === 999 && (
          <div className="bg-white rounded-3xl p-6 text-center space-y-3">
            <p className="text-4xl">🌱</p>
            <h2 className="font-bold text-lg" style={{ color: PALETTE.ink }}>Aún no puedes postular directamente</h2>
            <p className="text-sm text-gray-600">
              Los fondos exigen ser mayor de 18 años. Mientras tanto, si eres estudiante escolar puedes participar en el concurso nacional Impacto Emprendedor de la UDD, o postular junto a un adulto que lidere formalmente el proyecto.
            </p>
            <a
              href="https://impactoemprendedor.udd.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-bold px-4 py-2 rounded-xl text-white"
              style={{ backgroundColor: PALETTE.coral }}
            >
              Ver Impacto Emprendedor ↗
            </a>
            <div>
              <button onClick={restart} className="text-sm font-bold" style={{ color: PALETTE.coral }}>Volver al inicio</button>
            </div>
          </div>
        )}

        {/* Wizard */}
        {step >= 0 && step !== 999 && !done && !isMinor && (
          <div className="space-y-5">
            <div className="flex gap-1.5">
              {visibleQuestions.map((q, i) => (
                <div key={q.id} className="h-1.5 flex-1 rounded-full transition-colors" style={{ backgroundColor: i <= step ? PALETTE.coral : "#E3E1DC" }} />
              ))}
            </div>

            {(() => {
              const q = visibleQuestions[step];
              if (!q) return null;
              return (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: PALETTE.amber }}>{q.label}</p>
                    <h2 className="text-xl font-black leading-snug" style={{ color: PALETTE.ink }}>{q.text}</h2>
                    {q.help && <p className="text-sm text-gray-500 mt-2">{q.help}</p>}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => answer(q.id, o.value)}
                        className="w-full text-left bg-white rounded-2xl px-4 py-3.5 border border-gray-200 active:scale-95 transition-transform hover:border-gray-400"
                      >
                        <p className="font-semibold text-sm" style={{ color: PALETTE.ink }}>{o.label}</p>
                        {o.sub && <p className="text-xs text-gray-500 mt-0.5">{o.sub}</p>}
                      </button>
                    ))}
                  </div>
                  {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="text-sm font-semibold text-gray-400">← Pregunta anterior</button>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Resultados */}
        {done && !isMinor && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black" style={{ color: PALETTE.ink }}>Tu ruta de financiamiento</h2>
              <p className="text-sm text-gray-500 mt-1">
                Resultado personalizado según tu etapa, rubro, perfil y situación. Toca cada tarjeta para ver fechas, requisitos, ruta de postulación y el link oficial.
              </p>
            </div>

            {["hoy", "paso", "despues"].map((key) => {
              const meta = STATUS_META[key];
              const list = results[key];
              if (list.length === 0) return null;
              return (
                <section key={key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: meta.color }}>
                      {meta.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm leading-none" style={{ color: PALETTE.ink }}>{meta.title}</h3>
                      <p className="text-xs text-gray-400 leading-none mt-1">{meta.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {list.map((f) => <FundCard key={f.id} fund={f} />)}
                  </div>
                </section>
              );
            })}

            {results.hoy.length === 0 && results.paso.length === 0 && (
              <div className="bg-white rounded-3xl p-5 text-sm text-gray-600">
                Con tus respuestas actuales no hay fondos disponibles de inmediato, pero revisa los que se desbloquean más adelante: ahí está tu ruta de crecimiento.
              </div>
            )}

            {/* Recursos transversales */}
            <section className="space-y-2">
              <h3 className="font-bold text-sm" style={{ color: PALETTE.ink }}>Recursos para seguir explorando</h3>
              {ALWAYS_RESOURCES.map((p) => (
                <div key={p.name} className="bg-white rounded-2xl px-4 py-3 border border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: PALETTE.ink }}>{p.name}</p>
                      <p className="text-xs font-semibold" style={{ color: PALETTE.coral }}>{p.inst}</p>
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                      style={{ backgroundColor: PALETTE.coral + "12", color: PALETTE.coral }}
                    >
                      Ver ↗
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{p.note}</p>
                  <p className="text-xs text-gray-400 mt-1">🗓️ {p.calendar}</p>
                </div>
              ))}
            </section>

            <div className="rounded-2xl px-4 py-3 text-xs text-gray-500" style={{ backgroundColor: "#EDEBE6" }}>
              <strong>Última verificación de convocatorias: {VERSION.fecha} ({VERSION.label}).</strong> Montos, fechas y requisitos cambian por convocatoria y región y cambian por convocatoria y región. Antes de postular, revisa siempre las bases oficiales en el link de cada fondo. Postular es gratis: desconfía de quien cobre por "gestionar" tu postulación ante instituciones públicas. Esta herramienta orienta, no adjudica.
            </div>

            <button
              onClick={restart}
              className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 active:scale-95 transition-transform"
              style={{ borderColor: PALETTE.coral, color: PALETTE.coral }}
            >
              Hacer el diagnóstico de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
