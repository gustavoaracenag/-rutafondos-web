// ─────────────────────────────────────────────────────────────
// analytics.js — Medición RutaFondos con Google Analytics 4
// Envía los eventos del piloto. No registra datos personales
// (ni nombre, ni RUT, ni correo): solo respuestas agregadas.
// ─────────────────────────────────────────────────────────────

// Envío genérico: si GA4 no cargó (bloqueador, error), no rompe la web.
export const track = (evento, params = {}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", evento, params);
};

// KPI 1 — Diagnóstico iniciado (clic en "Encontrar mi fondo")
export const trackInicio = () => track("diagnostico_iniciado");

// Radiografía — cada respuesta del quiz (embudo y punto de abandono)
export const trackRespuesta = (preguntaId, valor) =>
  track("respuesta_quiz", { pregunta: preguntaId, respuesta: valor });

// Menores de 18: evento aparte para no distorsionar la tasa de término
export const trackMenor = () => track("menor_de_edad");

// KPI 2 — Diagnóstico completado + perfil completo + resultado del motor
export const trackCompletado = (answers, results) => {
  // "no_aplica" = la pregunta no se mostró a este perfil (preguntas condicionales)
  const v = (key) => answers[key] ?? "no_aplica";

  track("diagnostico_completado", {
    edad: v("edad"),
    etapa: v("etapa"),
    sector: v("sector"),
    perfil: v("perfil"),
    mujer: v("mujer"),
    rubro_masc: v("rubroMasc"),
    innovador: v("innovador"),
    ventas: v("ventas"),
    deudas: v("deudas"),
    rsh: v("rsh"),
    empleo: v("empleo"), // nuevo en v4.2: situación laboral (solo tramo 40% del RSH)
    n_puedes_postular: results.hoy.length,
    n_falta_paso: results.paso.length,
    n_mas_adelante: results.despues.length,
  });

  // Un evento por cada fondo que apareció en el resultado y en qué estado
  ["hoy", "paso", "despues"].forEach((estado) => {
    results[estado].forEach((f) =>
      track("resultado_fondo", {
        fondo: f.id,
        institucion: f.inst,
        tipo_fondo: f.type,
        estado,
      })
    );
  });
};

// KPI 4 — Derivación: clic en "Revisar sitio oficial"
export const trackClicFondo = (fund) =>
  track("clic_sitio_oficial", {
    fondo: fund.id,
    institucion: fund.inst,
    tipo_fondo: fund.type,
    estado: fund.status,
  });
