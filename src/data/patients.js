// Patient generation system with SOAP reports and pathology detection
import { normalizeDeepText, normalizeDisplayText } from '../utils/textSanitizer';
import { pickPersonality } from './patientPersonalities';

const FIRST_NAMES = [
  'María',
  'Carlos',
  'Ana',
  'Pedro',
  'Laura',
  'Miguel',
  'Elena',
  'David',
  'Sofía',
  'Javier',
  'Carmen',
  'Antonio',
  'Isabel',
  'Roberto',
  'Lucía',
  'Fernando',
  'Rosa',
  'Pablo',
  'Marta',
  'Andrés',
  'Diana',
  'Raúl',
  'Patricia',
  'Diego',
  'Valentina',
  'Héctor',
  'Claudia',
  'Sergio',
  'Natalia',
  'Óscar',
  'Alejandra',
  'Manuel',
  'Camila',
  'Ricardo',
  'Gloria',
  'Felipe',
  'Daniela',
  'Jorge',
  'Teresa',
  'Enrique',
  'Emilio',
  'Gabriela',
  'Víctor',
  'Lorena',
  'Francisco',
  'Adriana',
  'Eduardo',
  'Verónica',
  'Gabriel',
  'Silvia',
  'Alberto',
  'Sandra',
  'Roberto',
  'Monica',
  'Gustavo',
  'Andrea',
  'Luis',
  'Jessica',
  'Juan',
  'Mariana',
  'Alejandro',
  'Cristina',
  'Alberto',
  'Daniela',
  'Martín',
  'Lorena',
  'Tomás',
  'Valeria',
  'Santiago',
  'Natalia',
  'Bruno',
  'Ivana',
  'Matías',
  'Florencia',
  'Joaquín',
  'Bárbara',
];

const LAST_NAMES = [
  'García',
  'Martínez',
  'López',
  'González',
  'Rodríguez',
  'Hernández',
  'Pérez',
  'Sánchez',
  'Ramírez',
  'Torres',
  'Flores',
  'Rivera',
  'Gómez',
  'Díaz',
  'Cruz',
  'Morales',
  'Reyes',
  'Ruiz',
  'Ortiz',
  'Gutiérrez',
  'Navarro',
  'Romero',
  'Vargas',
  'Castillo',
  'Jiménez',
  'Molina',
  'Suárez',
  'Castro',
  'Rojas',
  'Delgado',
  'Aguilar',
  'Serrano',
  'Ramos',
  'Vega',
  'Campos',
  'Herrera',
  'Arias',
  'Medina',
  'Guzmán',
  'Reyes',
  'Cortés',
  'Sandoval',
  'Estrada',
  'Blanco',
  'Reyes',
  'Luna',
  'Santos',
  'Mejía',
  'Peralta',
  'Núñez',
  'Escobar',
  'Ochoa',
  'Paredes',
  'Lara',
  'Salazar',
];

const OCCUPATIONS = [
  'Oficinista',
  'Profesor/a',
  'Conductor/a',
  'Deportista',
  'Ama de casa',
  'Albañil',
  'Chef',
  'Programador/a',
  'Enfermero/a',
  'Mecánico/a',
  'Vendedor/a',
  'Agricultor/a',
  'Músico/a',
  'Peluquero/a',
  'Pintor/a',
  'Carpintero/a',
  'Abogado/a',
  'Electricista',
  'Bailarín/a',
  'Cartero/a',
];

// Non-dangerous conditions (treatable by chiropractor)
const TREATABLE_CONDITIONS = [
  {
    id: 'lumbar_pain',
    name: 'Dolor lumbar mecánico',
    subjective: 'Dolor en la zona baja de la espalda que empeora al estar sentado mucho tiempo.',
    objective:
      'Espasmo muscular en paravertebrales L4-L5. ROM limitado en flexión. Sin déficit neurológico.',
    assessment: 'Lumbalgia mecánica por contractura muscular',
    zones: ['lumbar'],
    difficulty: 1,
    xpReward: 15,
  },
  {
    id: 'cervical_tension',
    name: 'Tensión cervical',
    subjective:
      'Rigidez y dolor en el cuello, especialmente al girar la cabeza a la derecha. Usa ordenador 8h/día.',
    objective:
      'Contractura del trapecio superior derecho. Restricción C5-C6 en rotación. Reflejos normales.',
    assessment: 'Cervicalgia mecánica por tensión postural',
    zones: ['cervical'],
    difficulty: 1,
    xpReward: 15,
  },
  {
    id: 'thoracic_block',
    name: 'Bloqueo torácico',
    subjective:
      'Dolor entre los omóplatos al respirar profundo. Empeoró tras cargar cajas pesadas.',
    objective: 'Fijación articular T4-T6. Punto gatillo en romboides. Expansión torácica reducida.',
    assessment: 'Dorsalgia por subluxación torácica T4-T6',
    zones: ['thoracic'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'sciatic_mild',
    name: 'Ciática leve',
    subjective:
      'Dolor que baja por la pierna izquierda hasta la rodilla. No hay debilidad ni adormecimiento.',
    objective:
      'Lasègue positivo a 60°. Reflejos L4-S1 normales. Fuerza 5/5. Contractura piriforme izq.',
    assessment: 'Ciática por síndrome piriforme',
    zones: ['lumbar', 'gluteal'],
    difficulty: 2,
    xpReward: 25,
  },
  {
    id: 'headache_cervicogenic',
    name: 'Cefalea cervicogénica',
    subjective:
      'Dolores de cabeza frecuentes que empiezan en la nuca y suben a la frente. Sin náuseas ni aura.',
    objective: 'Restricción C1-C2 en rotación. Suboccipitales hipertónicos. Sin signos de alarma.',
    assessment: 'Cefalea cervicogénica por disfunción C1-C2',
    zones: ['cervical'],
    difficulty: 2,
    xpReward: 25,
  },
  {
    id: 'sacroiliac',
    name: 'Disfunción sacroilíaca',
    subjective: 'Dolor en la parte baja de la espalda y glúteo derecho. Peor al subir escaleras.',
    objective:
      'Test de Gaenslen positivo dcha. EIPS asimétrica. Piriforme contracturado bilateral.',
    assessment: 'Disfunción articulación sacroilíaca derecha',
    zones: ['lumbar', 'gluteal'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'postural_syndrome',
    name: 'Síndrome postural',
    subjective:
      'Dolor difuso en toda la espalda. Trabaja muchas horas de pie. Peor al final del día.',
    objective:
      'Hipercifosis torácica. Hombros anteriorizados. Contracturas múltiples. Sin hallazgos neurológicos.',
    assessment: 'Síndrome postural con múltiples contracturas',
    zones: ['cervical', 'thoracic', 'lumbar'],
    difficulty: 3,
    xpReward: 30,
  },
  {
    id: 'torticollis',
    name: 'Tortícolis aguda',
    subjective:
      'Se despertó con el cuello trabado, no puede girar a la izquierda. Dolor intenso 7/10.',
    objective:
      'Espasmo severo ECOM izquierdo. Cabeza inclinada a la izq. ROM cervical muy limitado.',
    assessment: 'Tortícolis aguda por espasmo muscular',
    zones: ['cervical'],
    difficulty: 2,
    xpReward: 25,
  },
  {
    id: 'rib_dysfunction',
    name: 'Costilla bloqueada',
    subjective:
      'Dolor agudo al lado derecho del pecho al respirar. Empezó después de estornudar fuerte.',
    objective:
      'Fijación costovertebral derecha T3-T4. Dolor a la palpación intercostal. Respiración superficial.',
    assessment: 'Disfunción costovertebral T3-T4 derecha',
    zones: ['thoracic'],
    difficulty: 3,
    xpReward: 30,
  },
  {
    id: 'muscle_strain',
    name: 'Distensión muscular',
    subjective: 'Dolor agudo en la espalda baja después de levantar un objeto pesado hace 2 días.',
    objective:
      'Contractura paravertebral L3-L4 bilateral. Dolor a la flexión. Sin signos neurológicos.',
    assessment: 'Distensión muscular lumbar aguda',
    zones: ['lumbar'],
    difficulty: 1,
    xpReward: 15,
  },
  {
    id: 'scoliosis_mild',
    name: 'Escoliosis funcional',
    subjective: 'Siente que tiene un hombro más alto que el otro. Dolor lumbar al caminar mucho.',
    objective:
      'Curva en "C" toracolumbar leve. Escápula derecha prominente. Test de Adams positivo leve.',
    assessment: 'Disfunción postural por escoliosis funcional',
    zones: ['thoracic', 'lumbar'],
    difficulty: 4,
    xpReward: 40,
  },
  {
    id: 'pelvic_torsion',
    name: 'Torsión pélvica',
    subjective: 'Siente una pierna más corta que la otra. Dolor punzante en el glúteo.',
    objective: 'EIPS dcha anteriorizada. Acortamiento funcional pierna dcha 1cm. Espasmo psoas.',
    assessment: 'Torsión pélvica mecánica',
    zones: ['lumbar', 'gluteal'],
    difficulty: 4,
    xpReward: 35,
  },
  // New treatable conditions
  {
    id: 'carpal_tunnel',
    name: 'Síndrome del túnel carpiano',
    subjective:
      'Adormecimiento y hormigueo en los dedos de la mano, especialmente de noche. Trabaja con ratón 8h/día.',
    objective:
      'Signo de Phalen positivo bilateral. Reflejo aquíleo conservado. Fuerza flexores dedos 4/5.',
    assessment: 'Síndrome del túnel carpiano por compresión del nervio mediano',
    zones: ['cervical'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'tmj_dysfunction',
    name: 'Disfunción témporomandibular',
    subjective:
      'Dolor y chasquidos al abrir la boca. No puede comer alimentos duros. Stress acumulado.',
    objective:
      'Limitación apertura oral a 35mm. Desviación mandibular a la derecha. Dolor a la palpación ATM.',
    assessment: 'Disfunción ATM por estrés y mala oclusión',
    zones: ['cervical'],
    difficulty: 3,
    xpReward: 30,
  },
  {
    id: 'shoulder_impingement',
    name: 'Síndrome de pinzamiento hombro',
    subjective:
      'Dolor en el hombro al levantar el brazo. No puede peinarse. Empeoró tras pintar techos.',
    objective: 'Signo de Neer positivo. Arco doloroso 60-120°. Contractura trapecio superior.',
    assessment: 'Síndrome de pinzamiento subacromial',
    zones: ['thoracic', 'cervical'],
    difficulty: 2,
    xpReward: 25,
  },
  {
    id: 'plantar_fasciitis',
    name: 'Fascitis plantar',
    subjective:
      'Dolor agudo en el talón al levantarse de la cama. Mejora al caminar pero duele al estar de pie.',
    objective: 'Dolor a la palpación calcáneo plantar. Fascia tensa. Sin signos neurológicos.',
    assessment: 'Fascitis plantar crónica',
    zones: ['lumbar'],
    difficulty: 3,
    xpReward: 25,
  },
  {
    id: 'hip_osteoarthritis',
    name: 'Artrosis de cadera',
    subjective: 'Dolor en la ingle y muslo al caminar. Rigidez matutina que mejora con movimiento.',
    objective: 'Limitación rotación interna cadera dcha. Test de FABER positivo. Crepitaciones.',
    assessment: 'Artrosis de cadera degenerativa',
    zones: ['lumbar', 'gluteal'],
    difficulty: 3,
    xpReward: 30,
  },
  {
    id: 'ankle_sprain',
    name: 'Esguince de tobillo',
    subjective:
      'Dolor e hinchazón en tobillo derecho tras torcedura hace 3 días. Camina con cojera.',
    objective:
      'Edema lateral tobillo. Dolor a la palpación ligamento peroneo-astragalino anterior.',
    assessment: 'Esguince lateral de tobillo grado II',
    zones: ['lumbar'],
    difficulty: 1,
    xpReward: 15,
  },
  {
    id: 'tennis_elbow',
    name: 'Codo de tenista',
    subjective:
      'Dolor en el codo derecho al agarrar objetos. Empeoró tras jugar pádel el fin de semana.',
    objective:
      'Dolor a la palpación epicóndilo lateral. Test de Cozen positivo. Fuerza puño reducida.',
    assessment: 'Epicondilitis lateral',
    zones: ['cervical', 'thoracic'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'piriformis_syndrome',
    name: 'Síndrome del piriforme',
    subjective:
      'Dolor profundo en el glúteo que baja por la parte posterior del muslo. Peor al sentarse.',
    objective: 'Dolor a la palpación del piriforme. Test de Pace positivo. Lasègue positivo a 50°.',
    assessment: 'Síndrome del piriforme por compresión del nervio ciático',
    zones: ['gluteal', 'lumbar'],
    difficulty: 3,
    xpReward: 28,
  },
  {
    id: 'kyphosis',
    name: 'Cifosis dorsal',
    subjective: 'Joroba visible en la espalda alta. Dolor crónico entre los omóplatos.',
    objective:
      'Hipercifosis torácica >50°. Hombros anteriorizados. Contractura extensores dorsales.',
    assessment: 'Síndrome de cifosis postural',
    zones: ['thoracic', 'cervical'],
    difficulty: 4,
    xpReward: 35,
  },
  {
    id: 'whiplash',
    name: 'Latigazo cervical',
    subjective: 'Dolor cervical intenso tras accidente de tráfico hace 2 días. Mareos y rigidez.',
    objective:
      'Contractura cervical severa. ROM muy limitado en todos los vectores. Reflejos normales.',
    assessment: 'Whiplash-associated disorder grado II',
    zones: ['cervical'],
    difficulty: 3,
    xpReward: 30,
  },
  {
    id: 'runner_knee',
    name: 'Rodilla del corredor',
    subjective:
      'Dolor anterior de rodilla al bajar escaleras. Cracking constante. Corre 10km diarios.',
    objective: 'Signo de apprehension positivo. Dolor a la palpación rótula. Crepitaciones.',
    assessment: 'Síndrome femoropatelar',
    zones: ['lumbar'],
    difficulty: 2,
    xpReward: 22,
  },
  {
    id: 'thoracic_outlet',
    name: 'Síndrome del desfiladero torácico',
    subjective:
      'Adormecimiento en brazo y mano al levantar objetos. Fatiga al trabajar con brazos elevados.',
    objective:
      'Test de Adson positivo izq. Debilidad intrínseca mano. Pulsos distales conservados.',
    assessment: 'Síndrome del desfiladero torácico neurovascular',
    zones: ['cervical', 'thoracic'],
    difficulty: 4,
    xpReward: 35,
  },
  // === NEW EDUCATIONAL CASES ===
  {
    id: 'ergonomic_strain',
    name: 'Lesión por esfuerzo ergonómico',
    subjective:
      'Dolor de cuello y hombros tras trabajar desde casa con portátil sin escritorio adecuado.',
    objective: 'Postura de cabeza adelantada. Tensión en trapecios. Test de Spurling negativo.',
    assessment: 'Síndrome de tensión postural por ergonomía deficiente',
    zones: ['cervical', 'thoracic'],
    difficulty: 1,
    xpReward: 15,
  },
  {
    id: 'text_neck',
    name: 'Text Neck (Cuello de texto)',
    subjective:
      'Dolor crónico en la base del cuello. Usa el teléfono móvil más de 4 horas diarias.',
    objective:
      'Inversión de lordosis cervical. Puntos gatillo en suboccipitales. Dolor a la extensión.',
    assessment: 'Síndrome de cuello textual - hiperflexión cervical crónica',
    zones: ['cervical'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'groin_strain',
    name: 'Distensión aductores',
    subjective: 'Dolor en la ingle al cambiar de dirección jugando al fútbol. Empeoró esta semana.',
    objective: 'Dolor a la palpación aductor largo izq. Test de squeeze positivo. Fuerza 3/5.',
    assessment: 'Distensión muscular grado II - aductores',
    zones: ['lumbar', 'gluteal'],
    difficulty: 2,
    xpReward: 22,
  },
  {
    id: 'sacral_tilt',
    name: 'Inclinación sacra',
    subjective:
      'Dolor en la parte baja de la espalda al estar mucho tiempo sentado. Un glúteo duerme.',
    objective: 'EIPS asimétrica notable. Test de Gillet positivo. Rotación sacra derecha.',
    assessment: 'Disfunción sacra en inclinación unilateral',
    zones: ['lumbar', 'gluteal'],
    difficulty: 3,
    xpReward: 28,
  },
  {
    id: 'forward_head',
    name: 'Cabeza adelantada',
    subjective:
      'Dolores de cabeza frecuentes, especialmente por las tardes. Mucho tiempo frente al ordenador.',
    objective: 'OMI 5cm anterior a la vertical. Hipertonía suboccipital. Reflejos normales.',
    assessment: 'Síndrome de cabeza adelantada con cefalea tensional',
    zones: ['cervical'],
    difficulty: 2,
    xpReward: 25,
  },
  {
    id: 'rotator_cuff_strain',
    name: 'Lesión del manguito rotador',
    subjective:
      'Dolor en el hombro al levantar el brazo. No puedeReach objetos altos. Empeora por la noche.',
    objective:
      'Debilidad abducción hombro. Signo de Jobe positivo. Dolor a la palpación supraespinoso.',
    assessment: 'Tendinopatía del manguito rotador - supraespinoso',
    zones: ['thoracic', 'cervical'],
    difficulty: 3,
    xpReward: 28,
  },
  {
    id: 'tennis_elbow_type',
    name: 'Epicondilitis lateral',
    objective:
      'Dolor en la cara externa del codo al extender la muñeca. Dolor a la palpación del epicóndilo.',
    subjective: 'Dolor en el codo después de cargar mal una maleta. Empeora al abrir puertas.',
    zones: ['cervical', 'thoracic'],
    assessment: 'Epicondilitis lateral - tendinopatía extensores',
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'golfer_elbow',
    name: 'Epicondilitis medial',
    subjective:
      'Dolor en el codo al hacer swing de golf. Dolor aladar objetos con la palma hacia arriba.',
    objective: 'Dolor a la palpación epicóndilo medial. Test de flexión de muñeca positivo.',
    assessment: 'Epicondilitis medial - tendinopatía flexores',
    zones: ['cervical', 'thoracic'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'meralgia_paresthetica',
    name: 'Meralgia parestésica',
    subjective:
      'Ardor y hormigueo en el muslo externo. No tolera ropa ajustada. Trabaja de pie 8h.',
    objective: 'Hipoestesia en territorio L2-L3 cara anterolateral muslo. Fuerza conservada.',
    assessment: 'Compresión del nervio femorocutáneo lateral',
    zones: ['lumbar'],
    difficulty: 2,
    xpReward: 18,
  },
  {
    id: 'tarsal_tunnel',
    name: 'Síndrome del túnel tarsiano',
    subjective:
      'Hormigueo y dolor en el pie que mejora al caminar. Sensación de quemazón en el talón.',
    objective: 'Signo de Tinel positivo en tarso. Sensibilidad alterada planta pie. Fuerza normal.',
    assessment: 'Compresión del nervio tibial posterior',
    zones: ['lumbar'],
    difficulty: 3,
    xpReward: 25,
  },
  {
    id: 'it_band_syndrome',
    name: 'Síndrome de la cintilla iliotibial',
    subjective:
      'Dolor en la cara externa de la rodilla al correr. Crujido audible. No puede correr.',
    objective: 'Test de Ober positivo. Dolor a la palpación cintilla a nivel epicóndilo lateral.',
    assessment: 'Síndrome de fricción de la cintilla iliotibial',
    zones: ['lumbar', 'gluteal'],
    difficulty: 3,
    xpReward: 28,
  },
  {
    id: 'patellar_tendonitis',
    name: 'Tendinitis rotuliana',
    subjective: 'Dolor bajo la rótula al saltar. Empeora al bajar escaleras. Juega al volleyball.',
    objective:
      'Dolor a la palpación tendón rotuliano. Test de Stoltz negativo. Fuerza cuadriceps 4/5.',
    assessment: 'Tendinopatía rotuliana - rodillera del saltador',
    zones: ['lumbar'],
    difficulty: 2,
    xpReward: 22,
  },
  {
    id: 'achilles_tendinopathy',
    name: 'Tendinopatía aquílea',
    subjective:
      'Rigidez y dolor en el talón por las mañanas. Empeora al correr. Usa calzado plano.',
    objective:
      'Engrosamiento palpable tendón aquíleo. Dolor a la palpación 2-6cm proximal a inserción.',
    assessment: 'Tendinopatía aquílea no insercional',
    zones: ['lumbar'],
    difficulty: 3,
    xpReward: 25,
  },
  {
    id: 'chronic_fatigue_posture',
    name: 'Fatiga postural crónica',
    subjective:
      'Cansancio constante en la espalda. Necesita recostarse frecuentemente. Trabaja sentada.',
    objective:
      'Postura cifótica. Debilidad músculos extensores dorsales. Sin hallazgos neurológicos.',
    assessment: 'Síndrome de fatiga postural por debilidad muscular',
    zones: ['cervical', 'thoracic', 'lumbar'],
    difficulty: 3,
    xpReward: 30,
  },
  {
    id: 'stress_tension',
    name: 'Tensión por estrés',
    subjective:
      'Dolor de hombros y cuello acumulado. Ha tenido mucho estrés laboral últimos meses.',
    objective:
      'Contractura bilateral trapecios. Puntos gatillo activos. Migraña tensional asociada.',
    assessment: 'Síndrome de tensión cervicocraneal por estrés',
    zones: ['cervical', 'thoracic'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'sleep_posture',
    name: 'Dolores por postura al dormir',
    subjective:
      'Despierta con el cuello rígido y dolor de cabeza. Duerme boca abajo con almohada alta.',
    objective:
      'Restricción en extensión cervical. Contractura suboccipital. Sin signos neurológicos.',
    assessment: 'Cervicalgia por postura de sueño incorrecta',
    zones: ['cervical'],
    difficulty: 1,
    xpReward: 15,
  },
  {
    id: 'carrying_posture',
    name: 'Dolores por cargar peso',
    subjective: 'Dolor en espalda baja después de cargar mochilas pesadas. Viaja frecuentemente.',
    objective: 'Contractura paravertebral lumbar. Test de Schober positivo con dolor.',
    assessment: 'Lumbalgia mecánica por sobrecarga postural',
    zones: ['lumbar', 'thoracic'],
    difficulty: 2,
    xpReward: 18,
  },
  {
    id: 'tech_shoulders',
    name: 'Hombros redondeados',
    subjective: 'Los hombros se han ido hacia adelante. Dolor al intentar echarlos hacia atrás.',
    objective: 'Hombros anteriores bilaterales. Contractura pectoral mayor. Debilidad romboides.',
    assessment: 'Síndrome de hombros redondeados - desequilibrio pectoral',
    zones: ['cervical', 'thoracic'],
    difficulty: 2,
    xpReward: 20,
  },
  {
    id: 'double_crutch',
    name: 'Síndrome del doble impacto',
    subjective:
      'Dolor de hombro que no mejora con reposo. Ha intentadol lev antar objetos por encima.',
    objective: 'Signo de Neer y Hawkins positivos. Arcos dolorosos activos y pasivos limitados.',
    assessment: 'Síndrome de impacto subacromial - fase II',
    zones: ['thoracic', 'cervical'],
    difficulty: 3,
    xpReward: 28,
  },
  {
    id: 'labral_tear_suspect',
    name: 'Posible lesión de labrum',
    subjective: 'Sensación de agarrotamiento en el hombro. Sonidos clics al mover el brazo.',
    objective: 'Test de click positivo. Signo de apprehension positivo. Fuerza conservada.',
    assessment: 'Sospecha de lesión de labrum glenoideo - derivar para RM',
    zones: ['thoracic', 'cervical'],
    difficulty: 4,
    xpReward: 35,
  },
  // === NEW CONTENT: 10 Additional Treatable Conditions ===
  {
    id: 'thoracic_outlet_syndrome',
    name: 'Síndrome del desfiladero torácico',
    subjective:
      'Hormigueo y pesadez en el brazo derecho al levantar objetos por encima de la cabeza. Trabaja en almacén.',
    objective:
      'Test de Adson positivo derecho. Test de Roos positivo. Pulsos distales conservados. Sin déficit motor.',
    assessment: 'Síndrome del desfiladero torácico por compresión neurovascular en escalenos',
    plan: 'Liberación de escalenos, movilización costal superior, ejercicios posturales y ergonomía laboral.',
    zones: ['cervical', 'thoracic'],
    difficulty: 3,
    xpReward: 30,
    basePayment: 120,
  },
  {
    id: 'costal_sprain',
    name: 'Esguince costal',
    subjective:
      'Dolor punzante en el costado izquierdo al respirar profundo. Empezó tras un partido de tenis.',
    objective:
      'Dolor a la palpación de articulación costocondral 5ª-6ª costilla izquierda. Expansión torácica asimétrica.',
    assessment: 'Esguince costocondral por sobreuso mecánico en rotación',
    plan: 'Movilización costal suave, terapia manual de tejidos blandos intercostales, vendaje funcional.',
    zones: ['thoracic'],
    difficulty: 2,
    xpReward: 22,
    basePayment: 90,
  },
  {
    id: 'postural_dorsalgia',
    name: 'Dorsalgia postural',
    subjective:
      'Dolor sordo entre los omóplatos que empeora por la tarde. Trabaja como costurera 10h/día.',
    objective:
      'Cifosis torácica aumentada. Contractura bilateral de romboides y trapecio medio. Sin irradiación.',
    assessment: 'Dorsalgia mecánica postural por sobrecarga estática prolongada',
    plan: 'Ajuste torácico T3-T7, liberación miofascial de romboides, programa de ejercicios posturales.',
    zones: ['thoracic'],
    difficulty: 1,
    xpReward: 18,
    basePayment: 75,
  },
  {
    id: 'mechanical_hip_pain',
    name: 'Coxalgia mecánica',
    subjective:
      'Dolor en la cadera derecha al levantarse de la silla y al subir al coche. Cojea tras caminar mucho.',
    objective:
      'Limitación rotación interna cadera dcha 15°. Test de FABER positivo. Sin crepitaciones groseras.',
    assessment: 'Coxalgia mecánica por restricción articular coxofemoral',
    plan: 'Movilización articular de cadera, liberación de psoas-ilíaco, ejercicios de movilidad y fortalecimiento glúteo.',
    zones: ['lumbar', 'gluteal'],
    difficulty: 2,
    xpReward: 25,
    basePayment: 100,
  },
  {
    id: 'maigne_syndrome',
    name: 'Síndrome de Maigne',
    subjective:
      'Dolor en la zona lumbar alta que se irradia a la cresta ilíaca. A veces siente dolor en la ingle.',
    objective:
      'Punto gatillo en unión toracolumbar T12-L1. Dolor a la palpación cresta ilíaca posterosuperior. Skin rolling positivo.',
    assessment: 'Síndrome de Maigne por irritación de la rama posterior T12-L1',
    plan: 'Ajuste específico de la charnela toracolumbar T12-L1, liberación de tejidos blandos paravertebrales, estiramientos.',
    zones: ['thoracic', 'lumbar'],
    difficulty: 3,
    xpReward: 30,
    basePayment: 110,
  },
  {
    id: 'acute_torticollis',
    name: 'Tortícolis aguda severa',
    subjective:
      'Se despertó con el cuello completamente bloqueado. No puede girar ni a derecha ni a izquierda. Dolor 9/10.',
    objective:
      'Espasmo severo bilateral ECOM y escalenos. Cabeza en posición antálgica. ROM cervical <10° en todas direcciones.',
    assessment: 'Tortícolis aguda severa por espasmo muscular protector',
    plan: 'Técnicas de tejido blando suave, calor local, movilización suave progresiva. Reevaluar en 48h.',
    zones: ['cervical'],
    difficulty: 2,
    xpReward: 25,
    basePayment: 95,
  },
  {
    id: 'cervical_epicondylitis',
    name: 'Epicondilitis lateral referida cervical',
    subjective:
      'Dolor en el codo que no mejora con tratamiento local. Ha probado férulas y fisioterapia sin éxito.',
    objective:
      'Test de Spurling positivo C5-C6. Reproducción del dolor de codo con compresión cervical. Epicóndilo sensible.',
    assessment: 'Epicondilitis lateral con componente de radiculopatía cervical C5-C6',
    plan: 'Ajuste cervical C5-C6, tracción manual, liberación de extensores de muñeca, ejercicios de nervio radial.',
    zones: ['cervical'],
    difficulty: 3,
    xpReward: 28,
    basePayment: 115,
  },
  {
    id: 'intercostal_neuralgia',
    name: 'Neuralgia intercostal',
    subjective:
      'Dolor quemante que sigue el trayecto de una costilla del lado derecho. Empeora con la tos y los estornudos.',
    objective:
      'Dolor neuropático en dermatoma T7 derecho. Hiperalgesia en franja intercostal. Sin vesículas. Costilla T7 fijada.',
    assessment: 'Neuralgia intercostal por atrapamiento nervioso T7 derecho',
    plan: 'Movilización costovertebral T7, liberación intercostal, técnicas de deslizamiento neural, hielo local.',
    zones: ['thoracic'],
    difficulty: 3,
    xpReward: 30,
    basePayment: 120,
  },
  {
    id: 'mechanical_sacroiliitis',
    name: 'Sacroileitis mecánica',
    subjective:
      'Dolor profundo en la zona del sacro que empeora al estar mucho de pie. A veces baja por el muslo posterior.',
    objective:
      'Test de Gaenslen positivo bilateral. Test de compresión sacroilíaca positivo. EIPS asimétrica marcada.',
    assessment: 'Sacroileitis mecánica bilateral por inestabilidad pélvica',
    plan: 'Ajuste sacroilíaco bilateral, cinturón pélvico temporal, ejercicios de estabilización core, fortalecimiento glúteo medio.',
    zones: ['lumbar', 'gluteal'],
    difficulty: 3,
    xpReward: 28,
    basePayment: 110,
  },
  {
    id: 'cervicogenic_headache_complex',
    name: 'Cefalea cervicogénica compleja',
    subjective:
      'Dolores de cabeza diarios que empiezan en la nuca, suben por un lado y llegan al ojo. Náuseas leves. Sin aura.',
    objective:
      'Restricción C0-C1 y C1-C2 bilateral. Suboccipitales hipertónicos con puntos gatillo activos. Test de flexión-rotación positivo.',
    assessment: 'Cefalea cervicogénica compleja por disfunción cervical alta C0-C2',
    plan: 'Ajuste específico C1-C2, inhibición suboccipital, tracción manual cervical alta, ejercicios de flexores profundos.',
    zones: ['cervical'],
    difficulty: 3,
    xpReward: 32,
    basePayment: 130,
  },
];

const INFLUENCERS = [
  { name: 'Logan Pauler', niche: 'Boxeo/Vlogs', followers: '20M', color: '#ff0' },
  { name: 'Ibai Llanos', niche: 'Streaming', followers: '15M', color: '#0af' },
  { name: 'Mr. Beastly', niche: 'Filantropía', followers: '100M', color: '#f0f' },
  { name: 'TheGrefg', niche: 'Gaming', followers: '18M', color: '#f50' },
];

// DANGEROUS conditions that MUST be referred to specialist
const REFERRAL_CONDITIONS = [
  {
    id: 'cauda_equina',
    name: '⚠️ Síndrome de Cauda Equina',
    subjective:
      'Dolor lumbar intenso con adormecimiento en zona perineal. Dificultad para orinar desde ayer.',
    objective:
      'Anestesia en silla de montar. Reflejos aquíleos abolidos bilateral. Retención urinaria.',
    assessment: 'SOSPECHA DE SÍNDROME DE CAUDA EQUINA - DERIVAR URGENTE',
    referralReason: 'Compresión de raíces nerviosas sacras. Emergencia neuroquirúrgica.',
    specialist: 'Neurocirugía - URGENCIAS',
    redFlags: ['Anestesia en silla de montar', 'Retención urinaria', 'Reflejos abolidos'],
    xpReward: 40,
  },
  {
    id: 'fracture_suspected',
    name: '⚠️ Sospecha de fractura vertebral',
    subjective: 'Dolor intenso tras caída de altura hace 3 horas. No puede moverse del dolor.',
    objective: 'Dolor exquisito a la palpación T12-L1. Espasmo protector severo. Hematoma visible.',
    assessment: 'SOSPECHA DE FRACTURA VERTEBRAL - NO MANIPULAR - DERIVAR',
    referralReason: 'Traumatismo con posible fractura. Requiere imagen diagnóstica urgente.',
    specialist: 'Traumatología - URGENCIAS',
    redFlags: ['Traumatismo reciente', 'Dolor exquisito puntual', 'Hematoma'],
    xpReward: 40,
  },
  {
    id: 'myelopathy',
    name: '⚠️ Mielopatía cervical',
    subjective:
      'Torpeza en las manos, dificultad para abrochar botones. Sensación eléctrica al flexionar cuello.',
    objective:
      'Signo de Lhermitte positivo. Hiperreflexia en MMII. Babinski positivo bilateral. Clonus.',
    assessment: 'SOSPECHA DE MIELOPATÍA CERVICAL - DERIVAR',
    referralReason: 'Signos de lesión de motoneurona superior. Compresión medular.',
    specialist: 'Neurología / Neurocirugía',
    redFlags: ['Signo de Lhermitte', 'Babinski positivo', 'Hiperreflexia'],
    xpReward: 45,
  },
  {
    id: 'tumor_suspected',
    name: '⚠️ Sospecha de tumor vertebral',
    subjective:
      'Dolor de espalda que no mejora con reposo, peor por la noche. Ha perdido 8kg en 2 meses sin dieta.',
    objective: 'Dolor nocturno que no cede. Pérdida de peso inexplicable. Fatiga marcada.',
    assessment: 'SOSPECHA DE PROCESO NEOPLÁSICO - DERIVAR PARA ESTUDIO',
    referralReason: 'Dolor nocturno + pérdida de peso = red flags de neoplasia.',
    specialist: 'Oncología / Medicina Interna',
    redFlags: ['Dolor nocturno', 'Pérdida de peso inexplicable', 'No mejora con reposo'],
    xpReward: 45,
  },
  {
    id: 'infection',
    name: '⚠️ Sospecha de infección vertebral',
    subjective:
      'Dolor de espalda constante con fiebre de 38.5°C. Tuvo una infección urinaria hace 2 semanas.',
    objective: 'Fiebre 38.5°C. Dolor severo a la percusión L2-L3. Sudoración nocturna.',
    assessment: 'SOSPECHA DE ESPONDILODISCITIS - DERIVAR URGENTE',
    referralReason:
      'Fiebre + dolor vertebral + antecedente infeccioso = posible infección vertebral.',
    specialist: 'Medicina Interna - URGENCIAS',
    redFlags: ['Fiebre', 'Infección previa', 'Dolor a la percusión'],
    xpReward: 40,
  },
  {
    id: 'aortic_aneurysm',
    name: '⚠️ Sospecha de aneurisma aórtico',
    subjective:
      'Dolor lumbar pulsátil que se irradia al abdomen. Paciente de 68 años, fumador, hipertenso.',
    objective: 'Masa abdominal pulsátil palpable. PA 160/95. Dolor no mecánico, constante.',
    assessment: 'SOSPECHA DE ANEURISMA AÓRTICO - DERIVAR URGENTE',
    referralReason: 'Masa pulsátil + factores de riesgo cardiovascular. Emergencia vascular.',
    specialist: 'Cirugía Vascular - URGENCIAS',
    redFlags: ['Masa pulsátil', 'Dolor no mecánico', 'Factores cardiovasculares'],
    xpReward: 50,
  },
  // New red flag conditions
  {
    id: 'spinal_stenosis',
    name: '⚠️ Estenosis espinal lumbar',
    subjective:
      'Dolor, adormecimiento y debilidad en ambas piernas al caminar. Mejora al sentarse.',
    objective:
      'Marcha neurológica alterada. Debilidad extensores dorsales pie bilateral. Reflejos hiperactivos.',
    assessment: 'SOSPECHA DE ESTENOSIS ESPINAL - DERIVAR',
    referralReason: 'Síntomas neurológicos progresivos. Requiere valoración neuroquirúrgica.',
    specialist: 'Neurología / Neurocirugía',
    redFlags: ['Claudicación neurogénica', 'Debilidad bilateral', 'Mejora con reposo'],
    xpReward: 45,
  },
  {
    id: 'spondylolisthesis',
    name: '⚠️ Espondilolistesis',
    subjective:
      'Dolor lumbar crónico que ha empeorado. Siente que la espalda cede al estar de pie.',
    objective:
      'Escalón palpable en línea media lumbar. Limitación lumbar severa. Signo de Stork positivo.',
    assessment: 'SOSPECHA DE ESPONDILOLISTESIS - DERIVAR',
    referralReason:
      'Inestabilidad vertebral. Requiere imagen diagnóstica y posibles limitaciones de actividad.',
    specialist: 'Traumatología / Neurocirugía',
    redFlags: ['Escalón vertebral', 'Inestabilidad', 'Empeoramiento progresivo'],
    xpReward: 45,
  },
  {
    id: 'osteoarthritis_suspicion',
    name: '⚠️ Sospecha de artrosis severa',
    subjective: 'Dolor articular severo que no mejora. Rigidez matutina de más de 30 minutos.',
    objective: 'Deformidad articular visible. Limitación importante ROM. Crepitaciones groseras.',
    assessment: 'SOSPECHA DE ARTROSIS SEVERA - DERIVAR A REUMATOLOGÍA',
    referralReason:
      'Patología articular degenerativa avanzada. Requiere tratamiento especializado.',
    specialist: 'Reumatología',
    redFlags: ['Rigidez matutina >30min', 'Deformidad articular', 'Limitación severa'],
    xpReward: 35,
  },
  {
    id: 'fibromyalgia',
    name: '⚠️ Sospecha de fibromialgia',
    subjective: 'Dolor muscular generalizado desde hace meses. Fatiga extrema, problemas de sueño.',
    objective:
      'Puntos gatillo positivos múltiples (>11/18). Sensibilidad generalizada. Sin hallazgos neurológicos.',
    assessment: 'SOSPECHA DE FIBROMIALGIA - DERIVAR A REUMATOLOGÍA',
    referralReason:
      'Síndrome de dolor crónico generalizado. Requiere diagnóstico y manejo multidisciplinar.',
    specialist: 'Reumatología',
    redFlags: ['Dolor generalizado', 'Fatiga crónica', 'Múltiples puntos gatillo'],
    xpReward: 35,
  },
  {
    id: 'ankylosing_spondylitis',
    name: '⚠️ Sospecha de espondilitis anquilosante',
    subjective:
      'Dolor lumbar inflamatorio que mejora con ejercicio. Rigidez matutina de más de 1 hora.',
    objective:
      'Limitación expansión torácica <2.5cm. Test de Schober positivo. Sacroilitis bilateral.',
    assessment: 'SOSPECHA DE ESPONDILITIS ANQUILOSANTE - DERIVAR URGENTE',
    referralReason:
      'Enfermedad inflamatoria crónica de columna. Requiere inicio temprano de tratamiento.',
    specialist: 'Reumatología - URGENCIAS',
    redFlags: ['Rigidez matutina >1h', 'Mejora con ejercicio', 'Limitación expansión torácica'],
    xpReward: 50,
  },
  {
    id: 'digestive_emergency',
    name: '⚠️ Patología digestiva aguda',
    subjective: 'Dolor abdominal intenso asociado a dolor de espalda. Náuseas, vómitos, fiebre.',
    objective: 'Dolor abdominal difuso conSigns de irritación peritoneal. Fiebre 38.5°C.',
    assessment: 'POSIBLE PATOLOGÍA DIGESTIVA AGUDA - DERIVAR URGENCIAS',
    referralReason: 'Dolor abdominal con signes de alarma. Descartar patología quirúrgica urgente.',
    specialist: 'Cirugía General - URGENCIAS',
    redFlags: ['Fiebre', 'Náuseas/vómitos', 'Dolor abdominal', 'Signos peritonealismo'],
    xpReward: 40,
  },
  // === NEW CONTENT: 5 Additional Referral Conditions ===
  {
    id: 'meningitis',
    name: '⚠️ Sospecha de meningitis',
    subjective:
      'Dolor de cabeza intenso con fiebre alta y no tolera la luz. Rigidez en el cuello desde anoche.',
    objective:
      'Fiebre 39.2°C. Rigidez nucal severa. Signo de Kernig positivo. Fotofobia marcada. Confusión leve.',
    assessment: 'SOSPECHA DE MENINGITIS - DERIVAR A URGENCIAS INMEDIATAMENTE',
    referralReason:
      'Triada clásica: fiebre + rigidez nucal + fotofobia. Posible infección meníngea. NO MANIPULAR.',
    specialist: 'Medicina Interna / Neurología - URGENCIAS',
    redFlags: ['Fiebre alta', 'Rigidez nucal', 'Fotofobia'],
    xpReward: 50,
  },
  {
    id: 'vertebral_artery_dissection',
    name: '⚠️ Sospecha de disección arterial vertebral',
    subjective:
      'Mareo intenso repentino con visión doble y dificultad para tragar. Dolor cervical tras movimiento brusco.',
    objective:
      'Nistagmo espontáneo. Diplopía. Disfagia. Disartria leve. Signo de Horner ipsilateral.',
    assessment: 'SOSPECHA DE DISECCIÓN ARTERIAL VERTEBRAL - EMERGENCIA VASCULAR - NO MANIPULAR',
    referralReason:
      'Síntomas vasculares cervicales agudos. Riesgo de ACV. Requiere imagen vascular urgente.',
    specialist: 'Neurología / Neurocirugía Vascular - URGENCIAS',
    redFlags: ['Mareo severo súbito', 'Visión doble', 'Disfagia'],
    xpReward: 55,
  },
  {
    id: 'spondylodiscitis',
    name: '⚠️ Espondilodiscitis',
    subjective:
      'Dolor de espalda constante que empeora por la noche y no cede con reposo. Fiebre intermitente. Ha perdido 4kg en un mes.',
    objective:
      'Fiebre 37.8°C. Dolor severo a la percusión L2-L3. Espasmo protector intenso. Sudoración nocturna referida.',
    assessment: 'SOSPECHA DE ESPONDILODISCITIS - DERIVAR PARA ESTUDIO URGENTE',
    referralReason:
      'Fiebre + dolor nocturno que no cede + pérdida de peso = alta sospecha de infección discal.',
    specialist: 'Medicina Interna / Infectología - URGENCIAS',
    redFlags: ['Fiebre', 'Dolor nocturno que no cede', 'Pérdida de peso'],
    xpReward: 45,
  },
  {
    id: 'severe_disc_herniation',
    name: '⚠️ Hernia discal con déficit neurológico severo',
    subjective:
      'Dolor lumbar irradiado a pierna izquierda. No puede levantar el pie. Ha notado problemas para controlar la orina.',
    objective:
      'Pie caído izquierdo (fuerza 1/5 dorsiflexión). Reflejo aquíleo abolido izq. Incontinencia urinaria referida. Lasègue positivo a 20°.',
    assessment: 'HERNIA DISCAL CON DÉFICIT NEUROLÓGICO SEVERO - DERIVAR URGENTE A NEUROCIRUGÍA',
    referralReason:
      'Pie caído + incontinencia urinaria = compresión radicular severa. Posible cirugía urgente.',
    specialist: 'Neurocirugía - URGENCIAS',
    redFlags: ['Pie caído', 'Incontinencia urinaria', 'Déficit motor severo'],
    xpReward: 50,
  },
  {
    id: 'pathological_fracture',
    name: '⚠️ Fractura vertebral patológica',
    subjective:
      'Dolor súbito en la espalda media sin haber tenido ningún golpe. Tiene osteoporosis severa diagnosticada. Nota deformidad.',
    objective:
      'Cifosis angular aguda T8. Dolor exquisito a la palpación T8. Deformidad visible. Sin déficit neurológico actual.',
    assessment: 'FRACTURA VERTEBRAL PATOLÓGICA POR OSTEOPOROSIS - NO MANIPULAR - DERIVAR',
    referralReason:
      'Osteoporosis severa + dolor súbito sin trauma + deformidad = fractura patológica. Requiere imagen urgente.',
    specialist: 'Traumatología / Reumatología - URGENCIAS',
    redFlags: ['Osteoporosis severa', 'Dolor súbito sin trauma', 'Deformidad vertebral'],
    xpReward: 45,
  },
];

// Premium/VIP patients for special events
const PREMIUM_PATIENTS = [
  {
    id: 'olympic_athlete',
    name: 'Atleta Olímpico',
    event: 'olympics',
    eventName: '🏅 Juegos Olímpicos',
    description: 'Un atleta de élite necesita ajuste antes de competir',
    subjective:
      'Tensión muscular por entrenamiento intenso. Competición mañana. Necesita estar al 100%.',
    objective:
      'Múltiples restricciones torácicas T3-T8. Contractura bilateral de psoas. Alto tono muscular.',
    zones: ['cervical', 'thoracic', 'lumbar'],
    difficulty: 4,
    payMultiplier: 5,
    xpReward: 100,
    minReputation: 50,
  },
  {
    id: 'boxer',
    name: 'Campeón de Boxeo',
    event: 'boxing',
    eventName: '🥊 Campeonato de Boxeo',
    description: 'El campeón necesita estar perfecto antes de la pelea del siglo',
    subjective: 'Dolor en zona cervical y hombros tras sparring intenso. Pelea titular en 2 días.',
    objective: 'Restricción C4-C5. Contractura trapecio bilateral. Restricción costal múltiple.',
    zones: ['cervical', 'thoracic'],
    difficulty: 4,
    payMultiplier: 5,
    xpReward: 100,
    minReputation: 60,
  },
  {
    id: 'kickboxer',
    name: 'Estrella de Kickboxing',
    event: 'kickboxing',
    eventName: '🦵 Torneo de Kickboxing',
    description: 'La estrella del kickboxing necesita tratamiento VIP',
    subjective:
      'Dolor en espalda baja y cadera tras patadas altas repetitivas. Torneo este fin de semana.',
    objective: 'Disfunción sacroilíaca bilateral. Contractura psoas-ilíaco. Restricción L3-L5.',
    zones: ['thoracic', 'lumbar', 'gluteal'],
    difficulty: 4,
    payMultiplier: 5,
    xpReward: 100,
    minReputation: 55,
  },
  {
    id: 'tennis_star',
    name: 'Tenista Profesional',
    event: 'tennis',
    eventName: '🎾 Grand Slam',
    description: 'Tenista top 10 del mundo necesita tratamiento antes del Grand Slam',
    subjective: 'Dolor en hombro y zona torácica por servicio repetitivo. Final del torneo mañana.',
    objective: 'Restricción T2-T5 derecha. Contractura infraespinoso. Disfunción costal alta.',
    zones: ['cervical', 'thoracic'],
    difficulty: 4,
    payMultiplier: 6,
    xpReward: 120,
    minReputation: 70,
  },
  {
    id: 'f1_driver',
    name: 'Piloto de F1',
    event: 'f1',
    eventName: '🏎️ Gran Premio de F1',
    description: 'Piloto de Fórmula 1 necesita ajuste cervical urgente',
    subjective: 'Dolor cervical y torácico por las fuerzas G. Carrera este domingo.',
    objective:
      'Restricción cervical múltiple C2-C6. Hipertonía cervical bilateral. Restricción T1-T3.',
    zones: ['cervical', 'thoracic'],
    difficulty: 5,
    payMultiplier: 8,
    xpReward: 150,
    minReputation: 80,
  },
  // New VIP special patients
  {
    id: 'famous_actor',
    name: 'Actor de Cine Famoso',
    event: 'movie',
    eventName: '🎬 Estreno Cinematográfico',
    description: 'El actor principal necesita estar perfecto para el estreno de su nueva película',
    subjective: 'Dolor lumbar por escenas de acción repetitivas. Entrevista importante mañana.',
    objective: 'Disfunción lumbar L4-L5. Contractura paravertebral. Restricción en flexión.',
    zones: ['lumbar', 'thoracic'],
    difficulty: 4,
    payMultiplier: 7,
    xpReward: 130,
    minReputation: 65,
  },
  {
    id: 'pop_singer',
    name: 'Estrella del Pop',
    event: 'concert',
    eventName: '🎤 Gira Mundial',
    description: 'La cantante más popular necesita tratamiento antes de su gira mundial',
    subjective: 'Dolor cervical y de hombros por actuaciones nocturnas. Primero de 50 conciertos.',
    objective: 'Restricción C3-C7 bilateral. Contractura trapecio-escalenos. Tensión postural.',
    zones: ['cervical', 'thoracic'],
    difficulty: 4,
    payMultiplier: 8,
    xpReward: 140,
    minReputation: 75,
  },
  {
    id: 'football_star',
    name: 'Futbolista Estrella',
    event: 'worldcup',
    eventName: '⚽ Copa Mundial',
    description: 'El crack del equipo necesita tratamiento antes del partido más importante',
    subjective: 'Dolor en muslo y cadera tras entrenamiento intenso. Final en 3 días.',
    objective: 'Disfunción sacroilíaca izquierda. Contractura aductores. Restricción lumbar L5-S1.',
    zones: ['lumbar', 'gluteal', 'thoracic'],
    difficulty: 5,
    payMultiplier: 10,
    xpReward: 180,
    minReputation: 85,
  },
  {
    id: 'marathon_runner',
    name: 'Maratoniano Profesional',
    event: 'marathon',
    eventName: '🏃 Maratón de Nueva York',
    description: 'El corredor de élite necesita preparación para la gran carrera',
    subjective: 'Tensión muscular generalizada por entrenamiento. Maratón en 1 semana.',
    objective:
      'Múltiples restricciones pélvicas. Contractura cuádriceps bilateral. Disfunción sacroilíaca.',
    zones: ['lumbar', 'gluteal', 'thoracic'],
    difficulty: 4,
    payMultiplier: 6,
    xpReward: 110,
    minReputation: 60,
  },
  {
    id: 'golf_pro',
    name: 'Profesional de Golf',
    event: 'golf',
    eventName: '⛳ Torneos de Golf',
    description: 'El mejor golfista del mundo necesita ajuste antes del major',
    subjective: 'Dolor en espalda baja por swing repetitivo. Primer major de la temporada.',
    objective: 'Hipertonía paravertebral lumbar. Disfunción T12-L1. Restricción rotación torácica.',
    zones: ['lumbar', 'thoracic'],
    difficulty: 4,
    payMultiplier: 7,
    xpReward: 125,
    minReputation: 70,
  },
];

// Special patients: children and elderly
const CHILD_PATIENTS = [
  {
    id: 'child_scoliosis',
    name: 'Niño con escoliosis',
    age: 12,
    subjective:
      'Los padres notan que tiene un hombro más alto que el otro. El niño se cansa rápido.',
    objective:
      'Curva torácica leve. Test de Adams positivo. Escápula derecha prominente en bipedestación.',
    zones: ['thoracic', 'cervical'],
    difficulty: 3,
    xpReward: 35,
    minSkillLevel: 2,
  },
  {
    id: 'child_posture',
    name: 'Adolescente con mala postura',
    age: 14,
    subjective: 'El adolescente pasa muchas horas con el móvil. Dolor de cuello y espalda.',
    objective:
      'Cifosis torácica aumentada. Cabeza anteriorizada. Hombros redondos. Sin signos neurológicos.',
    zones: ['cervical', 'thoracic'],
    difficulty: 2,
    xpReward: 25,
    minSkillLevel: 1,
  },
];

const ELDERLY_PATIENTS = [
  {
    id: 'elderly_osteoporosis',
    name: 'Anciano con sospecha de osteoporosis',
    age: 72,
    subjective: 'Dolor de espalda progresivo. Ha perdido estatura. Fragilidad ósea conocida.',
    objective: 'Cifosis severa. Dolor a la palpación vertebral difuso. Sin déficit neurológico.',
    zones: ['thoracic', 'lumbar'],
    difficulty: 3,
    xpReward: 30,
    minSkillLevel: 2,
    specialNote: 'Precaución: Manipulación suave, evitar técnicas de alta velocidad',
  },
  {
    id: 'elderly_arthritis',
    name: 'Anciano con artrosis',
    age: 68,
    subjective: 'Rigidez matutina de 20 minutos. Dolor que empeora con el frío y la humedad.',
    objective: 'Limitación articular lumbar. Crepitaciones. Sin signos de alarma neurológicos.',
    zones: ['lumbar', 'thoracic'],
    difficulty: 2,
    xpReward: 25,
    minSkillLevel: 1,
    specialNote: 'Técnicas suaves adaptadas a la edad',
  },
];

// Pathology reference book data
const PATHOLOGY_BOOK = {
  title: '📖 Manual de Banderas Rojas en Quiropráctica',
  chapters: [
    {
      title: 'Síndrome de Cauda Equina',
      description: 'Compresión de las raíces nerviosas sacras.',
      redFlags: [
        'Anestesia en silla de montar',
        'Retención o incontinencia urinaria',
        'Debilidad bilateral MMII',
      ],
      action: 'DERIVAR A URGENCIAS INMEDIATAMENTE',
    },
    {
      title: 'Fracturas Vertebrales',
      description: 'Pérdida de integridad ósea vertebral.',
      redFlags: [
        'Traumatismo reciente',
        'Dolor exquisito a la palpación',
        'Osteoporosis conocida',
        'Uso prolongado de corticoides',
      ],
      action: 'NO MANIPULAR - DERIVAR A TRAUMATOLOGÍA',
    },
    {
      title: 'Mielopatía',
      description: 'Compresión de la médula espinal.',
      redFlags: [
        'Signo de Lhermitte',
        'Babinski positivo',
        'Hiperreflexia',
        'Torpeza en manos',
        'Alteración de la marcha',
      ],
      action: 'DERIVAR A NEUROLOGÍA/NEUROCIRUGÍA',
    },
    {
      title: 'Neoplasias Vertebrales',
      description: 'Tumores primarios o metastásicos en columna.',
      redFlags: [
        'Dolor nocturno que no cede',
        'Pérdida de peso inexplicable',
        'Antecedente de cáncer',
        'Edad >50 con dolor nuevo',
      ],
      action: 'DERIVAR PARA ESTUDIO ONCOLÓGICO',
    },
    {
      title: 'Infecciones Vertebrales',
      description: 'Espondilodiscitis, absceso epidural.',
      redFlags: [
        'Fiebre',
        'Infección reciente',
        'Inmunosupresión',
        'Uso de drogas IV',
        'Sudoración nocturna',
      ],
      action: 'DERIVAR A MEDICINA INTERNA URGENTE',
    },
    {
      title: 'Patología Vascular',
      description: 'Aneurisma aórtico, disección arterial.',
      redFlags: [
        'Masa pulsátil abdominal',
        'Dolor no mecánico',
        'HTA no controlada',
        'Dolor torácico irradiado',
      ],
      action: 'DERIVAR A CIRUGÍA VASCULAR URGENTE',
    },
  ],
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const referralChance = 0.08;

const FIRST_NAMES_SANITIZED = FIRST_NAMES.map((name) => normalizeDisplayText(name));
const LAST_NAMES_SANITIZED = LAST_NAMES.map((name) => normalizeDisplayText(name));
const OCCUPATIONS_SANITIZED = OCCUPATIONS.map((occupation) => normalizeDisplayText(occupation));
const TREATABLE_CONDITIONS_SANITIZED = normalizeDeepText(TREATABLE_CONDITIONS);
const REFERRAL_CONDITIONS_SANITIZED = normalizeDeepText(REFERRAL_CONDITIONS);
const PREMIUM_PATIENTS_SANITIZED = normalizeDeepText(PREMIUM_PATIENTS);
const PATHOLOGY_BOOK_SANITIZED = normalizeDeepText(PATHOLOGY_BOOK);
const CHILD_PATIENTS_SANITIZED = normalizeDeepText(CHILD_PATIENTS);
const ELDERLY_PATIENTS_SANITIZED = normalizeDeepText(ELDERLY_PATIENTS);
const INFLUENCERS_SANITIZED = normalizeDeepText(INFLUENCERS);

const SOCIAL_PROFILES = {
  poor: {
    label: 'Recursos limitados',
    paymentMultiplier: 0.65,
    discountRequestChance: 0.45,
    noPayRisk: 0.03,
    repMultiplier: 1.15,
    returnChance: 0.2,
  },
  middle: {
    label: 'Clase media',
    paymentMultiplier: 1,
    discountRequestChance: 0.08,
    noPayRisk: 0.01,
    repMultiplier: 1,
    returnChance: 0.32,
  },
  rich: {
    label: 'Clase alta',
    paymentMultiplier: 1.85,
    discountRequestChance: 0.02,
    noPayRisk: 0,
    repMultiplier: 1.2,
    returnChance: 0.4,
  },
  conflictive: {
    label: 'Conflictivo',
    paymentMultiplier: 1.05,
    discountRequestChance: 0.5,
    noPayRisk: 0.3,
    repMultiplier: 0.9,
    returnChance: 0.12,
  },
  vip: {
    label: 'VIP',
    paymentMultiplier: 2.5,
    discountRequestChance: 0,
    noPayRisk: 0,
    repMultiplier: 1.5,
    returnChance: 0.55,
  },
};

function pickSocialClass(reputation = 0, consultPrice = 100, day = 1) {
  const rep = Math.max(0, reputation);
  const progression = Math.max(0, day - 1);
  const prestigeGrowth = Math.min(18, Math.floor(progression / 5));
  const priceOverBase = Math.max(0, Math.round((consultPrice - 100) / 12));
  const priceUnderBase = Math.max(0, Math.round((100 - consultPrice) / 14));

  const poorWeight = Math.max(
    6,
    35 - Math.floor(rep / 50) - Math.floor(progression / 6) + priceUnderBase * 3
  );
  const middleWeight = 45;
  const richWeight = Math.min(40, 8 + Math.floor(rep / 40) + priceOverBase * 2 + prestigeGrowth);
  const conflictiveWeight = Math.max(
    4,
    12 - Math.floor(rep / 100) - Math.floor(progression / 12) + priceUnderBase * 2
  );

  const total = poorWeight + middleWeight + richWeight + conflictiveWeight;
  const roll = Math.random() * total;

  if (roll < poorWeight) return 'poor';
  if (roll < poorWeight + middleWeight) return 'middle';
  if (roll < poorWeight + middleWeight + richWeight) return 'rich';
  return 'conflictive';
}

function generatePatient(skillLevel = 1, day = 1, reputation = 0, consultPrice = 100) {
  const firstName = randomFrom(FIRST_NAMES_SANITIZED);
  const lastName = randomFrom(LAST_NAMES_SANITIZED);
  const occupation = randomFrom(OCCUPATIONS_SANITIZED);

  let age;
  const isChild = Math.random() < 0.05;
  const isElderly = Math.random() < 0.08;

  if (isChild && skillLevel >= 2) {
    age = randomFrom(CHILD_PATIENTS_SANITIZED).age;
  } else if (isElderly) {
    age = randomBetween(65, 80);
  } else {
    age = randomBetween(18, 75);
  }

  const isReferralCase = Math.random() < referralChance;

  const isInfluencer = Math.random() < 0.05;
  let influencerData = null;
  if (isInfluencer) {
    influencerData = randomFrom(INFLUENCERS_SANITIZED);
  }

  let condition;
  if (isReferralCase) {
    condition = randomFrom(REFERRAL_CONDITIONS_SANITIZED);
  } else if (isChild && skillLevel >= 2) {
    const availableChild = CHILD_PATIENTS_SANITIZED.filter((c) => c.minSkillLevel <= skillLevel);
    condition = randomFrom(availableChild.length > 0 ? availableChild : CHILD_PATIENTS_SANITIZED);
  } else if (isElderly) {
    const availableElderly = ELDERLY_PATIENTS_SANITIZED.filter(
      (c) => c.minSkillLevel <= skillLevel
    );
    condition = randomFrom(
      availableElderly.length > 0 ? availableElderly : ELDERLY_PATIENTS_SANITIZED
    );
  } else {
    const available = TREATABLE_CONDITIONS_SANITIZED.filter((c) => c.difficulty <= skillLevel + 1);
    condition = randomFrom(
      available.length > 0 ? available : TREATABLE_CONDITIONS_SANITIZED.slice(0, 3)
    );
  }

  const payRange = {
    min: 50 + day * 2,
    max: 100 + day * 3 + skillLevel * 10,
  };

  const socialClass = isInfluencer ? 'vip' : pickSocialClass(reputation, consultPrice, day);
  const socialProfile = SOCIAL_PROFILES[socialClass] || SOCIAL_PROFILES.middle;
  const paymentBase = randomBetween(payRange.min, payRange.max) * (isInfluencer ? 3 : 1);
  const payment = Math.round(paymentBase * socialProfile.paymentMultiplier);
  const requiresDiscountNegotiation =
    !isInfluencer && Math.random() < socialProfile.discountRequestChance && !isReferralCase;

  return normalizeDeepText({
    id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName: isInfluencer ? influencerData.name : firstName,
    lastName: isInfluencer ? '' : lastName,
    fullName: isInfluencer ? influencerData.name : `${firstName} ${lastName}`,
    age,
    occupation: isInfluencer ? `Influencer (${influencerData.niche})` : occupation,
    condition,
    isReferralCase,
    isInfluencer,
    influencerInfo: influencerData,
    payment,
    socialClass,
    socialLabel: socialProfile.label,
    paymentMultiplier: socialProfile.paymentMultiplier,
    repMultiplier: socialProfile.repMultiplier,
    socialPaymentMultiplier: socialProfile.paymentMultiplier,
    socialRepMultiplier: socialProfile.repMultiplier,
    noPayRisk: socialProfile.noPayRisk,
    returnChance: socialProfile.returnChance,
    requiresDiscountNegotiation,
    negotiationResolved: !requiresDiscountNegotiation,
    discountApplied: false,
    discountRejected: false,
    satisfaction: 0,
    avatar: generatePixelAvatar(age, firstName),
    personality: pickPersonality(),
  });
}

export function generatePremiumPatient(reputation) {
  const available = PREMIUM_PATIENTS_SANITIZED.filter((p) => reputation >= p.minReputation);
  if (available.length === 0) return null;
  const premium = randomFrom(available);

  return normalizeDeepText({
    id: `premium_${Date.now()}`,
    firstName: premium.name,
    lastName: '',
    fullName: premium.name,
    age: randomBetween(22, 35),
    occupation: 'Deportista Profesional',
    condition: {
      ...premium,
      name: premium.eventName,
      assessment: `Tratamiento VIP - ${premium.eventName}`,
    },
    isReferralCase: false,
    isPremium: true,
    socialClass: 'vip',
    socialLabel: SOCIAL_PROFILES.vip.label,
    paymentMultiplier: SOCIAL_PROFILES.vip.paymentMultiplier,
    repMultiplier: SOCIAL_PROFILES.vip.repMultiplier,
    socialPaymentMultiplier: SOCIAL_PROFILES.vip.paymentMultiplier,
    socialRepMultiplier: SOCIAL_PROFILES.vip.repMultiplier,
    noPayRisk: 0,
    returnChance: SOCIAL_PROFILES.vip.returnChance,
    requiresDiscountNegotiation: false,
    negotiationResolved: true,
    discountApplied: false,
    discountRejected: false,
    event: premium.event,
    eventName: premium.eventName,
    payment: randomBetween(500, 1000) * premium.payMultiplier,
    satisfaction: 0,
    avatar: { hairColor: '#FFD700', skinTone: '#ffdbac', expression: 'determined' },
    personality: pickPersonality(),
  });
}

function generatePixelAvatar(age, name) {
  const hairColors = ['#2b1b0e', '#5a3825', '#8b6914', '#c4a35a', '#d4652f', '#1a1a2e', '#4a4a4a'];
  const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
  const expressions = ['neutral', 'worried', 'pain', 'happy'];

  return {
    hairColor: randomFrom(hairColors),
    skinTone: randomFrom(skinTones),
    expression: randomFrom(expressions.slice(0, 3)), // Start without happy
  };
}

export {
  generatePatient,
  generatePixelAvatar,
  TREATABLE_CONDITIONS_SANITIZED as TREATABLE_CONDITIONS,
  REFERRAL_CONDITIONS_SANITIZED as REFERRAL_CONDITIONS,
  PREMIUM_PATIENTS_SANITIZED as PREMIUM_PATIENTS,
  PATHOLOGY_BOOK_SANITIZED as PATHOLOGY_BOOK,
  CHILD_PATIENTS_SANITIZED as CHILD_PATIENTS,
  ELDERLY_PATIENTS_SANITIZED as ELDERLY_PATIENTS,
};
