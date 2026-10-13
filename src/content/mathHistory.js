// Historical notes paraphrased from the University of St Andrews MacTutor archive.
// These are connections to the modern activities, not claims that their UI existed then.
const archive = 'https://mathshistory.st-andrews.ac.uk/'

export const mathHistory = {
  counting: {
    place: 'Egipto antiguo', title: 'Multiplicar con sumas',
    body: 'El papiro Rhind muestra una forma de multiplicar duplicando cantidades y sumando las filas necesarias. Una multiplicación podía construirse con sumas.',
    connection: 'Aquí cada fila es un grupo igual. Añadir una fila suma otra vez la misma cantidad.',
    source: `${archive}HistTopics/Egyptian_papyri/`,
  },
  fractions: {
    place: 'Egipto antiguo', title: 'Una parte puede tener muchos nombres',
    body: 'Los escribas egipcios trabajaban con fracciones unitarias, como 1/3 y 1/15. El papiro Rhind incluye tablas para expresar ciertas fracciones como sumas de partes.',
    connection: 'Nuestra notación es moderna. Cambiar el tamaño de los trozos también permite nombrar la misma cantidad de otra manera.',
    source: `${archive}HistTopics/Egyptian_papyri/`,
  },
  powers: {
    place: 'Mesopotamia antigua', title: 'Tablas de cuadrados en arcilla',
    body: 'Las tablillas babilónicas incluyen tablas de cuadrados. Tener resultados organizados ayudaba a realizar cálculos antes de las calculadoras.',
    connection: 'El segundo paso de esta tabla es un cuadrado: base × base. Cada paso siguiente multiplica otra vez por la base.',
    source: `${archive}HistTopics/Babylonian_mathematics/`,
  },
  algebra: {
    place: 'Bagdad · siglo IX', title: 'Resolver lo desconocido',
    body: 'Al-Juarismi explicó métodos para resolver ecuaciones en un tratado cuyo título contiene al-jabr, origen de la palabra álgebra. Buscaba resolver problemas prácticos de comercio y reparto.',
    connection: 'La balanza es nuestro modelo visual moderno: una operación debe aplicarse a ambos lados para conservar la igualdad.',
    source: `${archive}Biographies/Al-Khwarizmi/`,
  },
  systems: {
    place: 'China antigua', title: 'Dos pistas a la vez',
    body: 'Los Nueve Capítulos sobre el Arte Matemático incluyen un método para resolver sistemas de ecuaciones. Se organizaban cantidades y se eliminaban términos para encontrar las incógnitas.',
    connection: 'Aquí buscamos el punto que cumple las dos pistas. La eliminación y la gráfica son dos caminos hacia la misma solución.',
    source: `${archive}HistTopics/Nine_chapters/`,
  },
  functions: {
    place: 'Francia · 1637', title: 'Unir ecuaciones y dibujos',
    body: 'En La Géométrie, René Descartes conectó el álgebra y la geometría. Esa relación permite estudiar curvas mediante ecuaciones.',
    connection: 'La tabla, la máquina y la recta cuentan la misma historia: a cada entrada x le corresponde una salida.',
    source: `${archive}Biographies/Descartes/`,
  },
  geometry: {
    place: 'Mesopotamia antigua', title: 'Triángulos antes de Pitágoras',
    body: 'Hay problemas babilónicos de triángulos rectángulos anteriores a Pitágoras. La relación entre sus lados tiene una historia que atraviesa varias culturas.',
    connection: 'Los cuadrados muestran por qué la fórmula habla de áreas: a² + b² = c², siempre para un triángulo rectángulo.',
    source: `${archive}HistTopics/Babylonian_Pythagoras/`,
  },
  probability: {
    place: 'Francia · 1654', title: 'Contar lo que puede pasar',
    body: 'Blaise Pascal y Pierre de Fermat intercambiaron cartas sobre problemas de azar en 1654. Su correspondencia ayudó a desarrollar la teoría matemática de la probabilidad.',
    connection: 'Contamos todos los resultados posibles de dos dados y luego los que cumplen nuestra condición. Cada pareja tiene la misma probabilidad si los dados son justos e independientes.',
    source: `${archive}Biographies/Pascal/`,
  },
}
