// Funny patient reviews shown as toast notifications after treatment

export const REVIEWS = {
  perfect: [
    { stars: 5, text: 'Me crujió todo. TODO. Hasta partes que no sabía que tenía. 10/10' },
    { stars: 5, text: 'Entré caminando como un cangrejo, salgo bailando salsa' },
    { stars: 5, text: 'Mi vecina me recomendó venir. Ahora somos las dos adictas' },
    { stars: 5, text: 'El crack que hizo mi espalda se escuchó en el estacionamiento' },
    { stars: 5, text: 'Mejor que un masaje. Mejor que una siesta. Mejor que pizza. Casi.' },
    { stars: 5, text: 'Le conté a mi madre y ahora quiere venir todos los días' },
    { stars: 5, text: 'Llevo 20 años con dolor y en 10 minutos... adiós dolor. ¿Magia?' },
    { stars: 5, text: 'No sé qué me hizo pero quiero más' },
  ],
  good: [
    { stars: 4, text: 'Buen doctor. El crack me asustó, pero funcionó' },
    { stars: 4, text: 'Me quitó el dolor. Le quité $150. Trato justo' },
    { stars: 4, text: 'Profesional. Aunque la sala de espera necesita revistas nuevas' },
    { stars: 4, text: '4/5 porque no me ofreció café. Pero el tratamiento, excelente' },
    { stars: 4, text: 'La asistente es muy simpática. El doctor también, supongo' },
    { stars: 4, text: 'Buena experiencia. Mi espalda aprueba con nota' },
  ],
  bad: [
    { stars: 2, text: 'Me tocó la espalda y me cobró. Mi gato hace lo mismo gratis' },
    { stars: 1, text: '0 estrellas pero el mínimo es 1. Me duele más que antes' },
    { stars: 2, text: 'Creo que crujió una parte que no debía. Ahora giro el cuello 360°' },
    { stars: 1, text: 'Vine por dolor de espalda y me fui con dolor de espalda Y de bolsillo' },
    { stars: 2, text: 'No recomiendo. Aunque el wifi de la sala de espera era bueno' },
    { stars: 3, text: 'Ni bien ni mal. Como ir al dentista pero con más cracks' },
  ],
};

/**
 * Get a random review based on treatment quality (0-100)
 * @param {number} quality - Treatment quality percentage
 * @param {string} patientName - Patient name for personalization
 * @returns {{ stars: number, text: string, author: string }}
 */
export function getRandomReview(quality, patientName) {
  let pool;
  if (quality >= 90) pool = REVIEWS.perfect;
  else if (quality >= 60) pool = REVIEWS.good;
  else pool = REVIEWS.bad;

  const review = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...review,
    author: patientName || 'Paciente Anónimo',
  };
}
