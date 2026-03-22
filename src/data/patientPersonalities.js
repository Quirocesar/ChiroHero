export const PATIENT_PERSONALITIES = [
  {
    id: 'hypochondriac',
    nameTag: 'Hipocondríaco',
    weight: 10,
    quirk: 'Creo que tengo 15 enfermedades diferentes',
    greetings: [
      'Doctor, creo que me estoy muriendo... otra vez',
      'He venido porque Google dice que me quedan 3 días',
      'Traigo una lista de 47 síntomas, ¿tiene un momento?',
    ],
    reactions: {
      happy: [
        '¡No me estoy muriendo! ...¿o sí?',
        '¿Seguro que no necesito una resonancia?',
      ],
      angry: [
        '¡Lo sabía! Esto es peor de lo que pensaba',
        'Voy a pedir una segunda opinión... y una tercera',
      ],
      pain: ['¡¡¡AAAGH!!! ¿Eso fue un hueso?!', '¡Anote eso como nuevo síntoma!'],
    },
    treatmentComment: '¿Puede revisar este lunar también?',
  },
  {
    id: 'gymBro',
    nameTag: 'Gym Bro',
    weight: 10,
    quirk: 'Esto me pasó haciendo peso muerto',
    greetings: [
      'Bro, me lesioné en el gym. ¿Puedo entrenar mañana?',
      'Creo que me pasé con las sentadillas... otra vez',
      'Necesito que me arregles rápido, tengo leg day mañana',
    ],
    reactions: {
      happy: [
        '¡Genial! ¿Puedo hacer deadlift hoy?',
        'Bro, eres el mejor. Te recomiendo en el gym',
      ],
      angry: [
        'No entreno hace 2 días por tu culpa',
        '¿Seguro que no es por falta de proteína?',
      ],
      pain: [
        'No pain no gain, ¿no?',
        '¡Eso dolió más que mi PR de sentadilla!',
      ],
    },
    treatmentComment: '¿El creatina puede causar esto?',
  },
  {
    id: 'googler',
    nameTag: 'Dr. Google',
    weight: 10,
    quirk: 'Según internet tengo algo grave...',
    greetings: [
      'Doctor, según WebMD tengo 7 enfermedades terminales',
      'Ya me autodiagnostiqué, solo vengo por la receta',
      'Vi un video en YouTube sobre mi condición...',
    ],
    reactions: {
      happy: [
        '¡Internet tenía razón! ...sobre el tratamiento al menos',
        'Voy a dejar una reseña de 5 estrellas en Google',
      ],
      angry: [
        'En Reddit dicen que esto no funciona',
        'Voy a investigar más y vuelvo',
      ],
      pain: [
        '¡¡En el foro no dijeron que dolía!!',
        'Esto NO es lo que mostraba el tutorial de YouTube',
      ],
    },
    treatmentComment: '¿Puedo grabarlo para mi TikTok?',
  },
  {
    id: 'dramatic',
    nameTag: 'Dramático/a',
    weight: 10,
    quirk: '¡¡¡AYYYY!!! ...ah espera, ya pasó',
    greetings: [
      '¡¡¡NO PUEDO MÁS CON EL DOLOR!!! ...bueno, un poco sí puedo',
      '*entra llorando* Es que... *deja de llorar* ¿tiene café?',
      '¡Es el peor dolor de mi VIDA! ...¿eso es un caramelo?',
    ],
    reactions: {
      happy: [
        '*llora de felicidad* ¡ES UN MILAGRO!',
        '¡Voy a nombrar a mi hijo como usted!',
      ],
      angry: [
        '*llora dramáticamente* ¡NUNCA me recuperaré!',
        '*suspiro teatral* Ya nada importa...',
      ],
      pain: [
        '¡¡¡AYYYYYYYY!!! *pausa* ¿ya terminó?',
        '¡¡SOCORRO!! ...ah, era cosquillas',
      ],
    },
    treatmentComment: '*suspiro dramático* Continúe...',
  },
  {
    id: 'skeptic',
    nameTag: 'Escéptico/a',
    weight: 8,
    quirk: '¿Seguro que esto funciona?',
    greetings: [
      '¿Esto tiene evidencia científica o es como la homeopatía?',
      'Vengo porque mi esposa me obligó. Yo no creo en esto',
      '¿Cuántos años de universidad se necesitan para... crujir huesos?',
    ],
    reactions: {
      happy: [
        'OK, admito que fue... aceptable',
        'No digo que funcionó, pero... ya no me duele',
      ],
      angry: [
        'Lo sabía. Debí ir al traumatólogo',
        'Voy a escribir una queja... formal',
      ],
      pain: ['Eso confirma mis sospechas', '¿Tiene seguro de mala praxis?'],
    },
    treatmentComment: '¿Esto es legal en todos los países?',
  },
  {
    id: 'talker',
    nameTag: 'Parlanchín/a',
    weight: 10,
    quirk: 'Y te cuento que mi vecina también...',
    greetings: [
      'Hola doctor, le cuento, es que ayer mi vecina me dijo que...',
      'Antes de empezar, ¿le conté lo que pasó en la panadería?',
      '¿Sabe qué? Le voy a contar todo desde el principio. Era 1987...',
    ],
    reactions: {
      happy: [
        '¡Qué bien! Oye, ¿te conté lo de mi primo?',
        'Genial, ahora le cuento sobre mi gato...',
      ],
      angry: [
        'Pues mi cuñada dice que otro doctor...',
        'Le voy a contar esto a todo el mundo...',
      ],
      pain: [
        '¡Ay! Como decía, mi vecina...',
        '¡Ouch! Eso me recuerda a cuando en 1995...',
      ],
    },
    treatmentComment:
      '¿Le conté que mi tía también es quiropráctica? Bueno, masajista. Bueno, sobaba.',
  },
  {
    id: 'tough',
    nameTag: 'Duro/a',
    weight: 8,
    quirk: 'No me duele nada (claramente le duele todo)',
    greetings: [
      'No me duele nada. Solo vengo por... prevención',
      '*cojeando* Estoy perfectamente bien, solo pasaba por aquí',
      'Un amigo me dijo que viniera. Yo no necesito doctor',
    ],
    reactions: {
      happy: [
        'Sí, bueno, tampoco es que me doliera tanto antes',
        'Ya lo sabía, solo quería confirmar',
      ],
      angry: [
        'No importa, tampoco duele tanto *tic en el ojo*',
        'Pff, esto es nada comparado con lo que aguanto',
      ],
      pain: ['...', '*aprieta los dientes* Todo bien aquí'],
    },
    treatmentComment: '*sudando* Totalmente relajado, no se preocupe.',
  },
  {
    id: 'impatient',
    nameTag: 'Con Prisa',
    weight: 8,
    quirk: '¿Ya terminamos? Tengo prisa',
    greetings: [
      '¿Cuánto tarda esto? Tengo una reunión en 10 minutos',
      '¿No hay un tratamiento express? Algo rápido',
      'Mire, necesito que me arregle la espalda en 5 minutos. ¿Se puede?',
    ],
    reactions: {
      happy: [
        '¡Por fin! *sale corriendo*',
        'Bien bien, la próxima más rápido ¿sí?',
      ],
      angry: [
        '*mirando el reloj intensamente*',
        'Esto tomó demasiado. Le dejo 3 estrellas',
      ],
      pain: [
        '¡Rápido rápido, que duele Y tengo prisa!',
        '¿No puede crujir más fuerte para que sea más rápido?',
      ],
    },
    treatmentComment: '¿Cuánto falta? *mira el reloj*',
  },
  {
    id: 'grateful',
    nameTag: 'Agradecido/a',
    weight: 12,
    quirk: '¡Eres el mejor doctor del mundo!',
    greetings: [
      '¡Qué alegría verle, doctor! Mi espalda le extrañaba',
      'Mi vida cambió desde que vengo aquí. Bueno, mi espalda al menos',
      '¡Doctor favorito! Traje galletitas para la sala de espera',
    ],
    reactions: {
      happy: [
        '¡GRACIAS! ¡Le debo la vida! Bueno, la espalda',
        '¡Es usted un ÁNGEL con bata blanca!',
      ],
      angry: [
        'No pasa nada, seguro la próxima va mejor',
        'Igual le quiero, doctor. Aunque me duela',
      ],
      pain: [
        '¡Ay! Pero sé que es por mi bien',
        'Duele pero CONFÍO en usted ciegamente',
      ],
    },
    treatmentComment: '¿Le traigo café la próxima vez?',
  },
  {
    id: 'conspiracist',
    nameTag: 'Conspiranoico/a',
    weight: 6,
    quirk: 'Las farmacéuticas no quieren que sepas esto',
    greetings: [
      'Vengo porque los doctores normales trabajan para Big Pharma',
      '¿Sabía que el dolor de espalda lo inventó la industria del colchón?',
      'Confío en usted porque la quiropráctica es la VERDADERA medicina',
    ],
    reactions: {
      happy: [
        '¡Lo sabía! La medicina natural SÍ funciona',
        '¿Ve? Sin pastillas. Las farmacéuticas odian esto',
      ],
      angry: [
        '¿No me habrá puesto un chip? Pregunto nada más',
        'Mmm... ¿seguro que no trabaja para ellos?',
      ],
      pain: [
        'Es el gobierno que me pone tenso',
        '¡Esto es lo que nos hacen! ¡NOS QUIEREN ENFERMOS!',
      ],
    },
    treatmentComment: '¿Ha probado el agua de mar? Es milagrosa.',
  },
];

// Helper to pick a random personality based on weight
export function pickPersonality() {
  const totalWeight = PATIENT_PERSONALITIES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const p of PATIENT_PERSONALITIES) {
    roll -= p.weight;
    if (roll <= 0) return p;
  }
  return PATIENT_PERSONALITIES[0];
}

// Get a random item from an array
export function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
