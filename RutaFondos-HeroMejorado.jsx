// ============================================
// COMPONENTE HERO MEJORADO - RutaFondos v4.2
// ============================================
// Reemplaza la sección hero/portada del componente principal
// Colores: Coral #E8543F, Teal #14B8A6, Tinta #1E2430

export function HeroMejorado() {
  return (
    <div className="w-full bg-white">
      {/* BANNER PILOTO */}
      <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mb-8 rounded">
        <p className="text-teal-700 font-semibold text-sm mb-1">
          🔬 Estamos validando. Tu feedback nos ayuda a mejorar.
        </p>
        <p className="text-gray-600 text-xs">
          Verifica siempre las bases oficiales antes de postular.
        </p>
      </div>

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-12 pb-6 border-b border-gray-200">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
          RF
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RutaFondos</h1>
          <p className="text-sm text-gray-600">Financiamiento público y privado · Chile</p>
        </div>
      </div>

      {/* HERO TITLE */}
      <div className="mb-8">
        <div className="text-xs font-bold letter-spacing-wide text-red-500 uppercase mb-2">
          Orientador de fondos concursables
        </div>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
          Hay fondos para tu proyecto.
          <br />
          El problema es saber <span className="text-red-500">cuál te corresponde</span>.
        </h2>
      </div>

      {/* VALUE CARD */}
      <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8">
        <div className="text-xs font-bold letter-spacing-wide text-teal-400 uppercase mb-3">
          Cómo funciona
        </div>
        <h3 className="text-3xl font-bold leading-tight mb-4">
          Responde unas preguntas.
          <br />
          Te mostramos <span className="text-red-400">qué fondos calzan contigo</span>.
        </h3>
        <p className="text-white text-opacity-90 leading-relaxed">
          Nuestro motor de elegibilidad analiza tu etapa, sector, perfil y situación.
          Te muestra cuáles puedes postular <strong>hoy</strong>, cuáles te falta un paso,
          y cuáles se desbloquean más adelante — con links oficiales y fechas de convocatoria.
        </p>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 py-8 border-t border-b border-gray-200">
        <div className="text-center">
          <div className="text-5xl font-bold text-red-500 mb-2">19+</div>
          <div className="text-xs font-semibold uppercase letter-spacing-wider text-gray-600">Fondos</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-red-500 mb-2">✓</div>
          <div className="text-xs font-semibold uppercase letter-spacing-wider text-gray-600">
            Diagnóstico personalizado
          </div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-red-500 mb-2">✓</div>
          <div className="text-xs font-semibold uppercase letter-spacing-wider text-gray-600">Sin registro</div>
        </div>
      </div>

      {/* INSTITUCIONES */}
      <div className="my-12">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Instituciones que cubrimos</h3>

        {/* PÚBLICAS */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase letter-spacing-wider text-red-500 pb-3 border-b-2 border-red-500 mb-4">
            🏛️ Sector público
          </div>
          <div className="flex flex-wrap gap-3">
            {['Sercotec', 'Corfo', 'INDAP', 'PRODEMU', 'FOSIS', 'SENCE'].map((inst) => (
              <span
                key={inst}
                className="px-4 py-2 rounded-full text-sm font-medium border-2 border-red-500 text-red-500 bg-red-50"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>

        {/* PRIVADAS */}
        <div>
          <div className="text-xs font-bold uppercase letter-spacing-wider text-teal-600 pb-3 border-b-2 border-teal-500 mb-4">
            🏦 Bancos y fondos privados
          </div>
          <div className="flex flex-wrap gap-3">
            {['Abastible', 'Banco de Chile', 'Fundación Luksic', 'ChileConverge', 'Jump Chile'].map((inst) => (
              <span
                key={inst}
                className="px-4 py-2 rounded-full text-sm font-medium border-2 border-teal-500 text-teal-600 bg-teal-50"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center my-12">
        <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-lg text-lg">
          Hacer mi diagnóstico →
        </button>
        <p className="text-gray-600 text-sm mt-4">
          Gratis · Sin registro · Convocatorias verificadas al 24 de octubre de 2026
          <span className="ml-2 inline-block bg-gray-100 text-red-500 px-2 py-1 rounded text-xs font-bold">
            v4.2
          </span>
        </p>
      </div>

      {/* FOOTER NOTE */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          RutaFondos es una herramienta de diagnóstico.
          <br />
          Verifica siempre las bases oficiales antes de postular.
        </p>
      </div>
    </div>
  );
}

// ============================================
// INSTRUCCIONES DE INTEGRACIÓN
// ============================================
// 1. Copia este componente a tu archivo RutaFondos.jsx
// 2. Reemplaza la sección hero/portada actual con <HeroMejorado />
// 3. Verifica que Tailwind esté configurado con:
//    - colors.red[500] = #E8543F (coral)
//    - colors.teal[500] = #14B8A6
//    - colors.gray[900] = #1E2430 (tinta)
// 4. Si usas colores personalizados, actualiza en tailwind.config.js:
//
//    module.exports = {
//      theme: {
//        extend: {
//          colors: {
//            coral: '#E8543F',
//            teal: '#14B8A6',
//            tinta: '#1E2430',
//          }
//        }
//      }
//    }
//
// 5. Luego reemplaza 'red-500' por 'coral' y 'teal-500' por 'teal' en el componente
// 6. Sube a GitHub y verifica en Vercel
//
// ============================================
