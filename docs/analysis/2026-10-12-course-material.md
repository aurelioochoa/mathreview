# Course material audit and delivered visual lessons

Reviewed the eight world definitions, the six Bloque study pages, and the existing widget inventory on 2026-10-12. The progression already has contextual questions, worked examples, reminders, mistake lists, and useful manipulatives. Its weakest explanations were the bridge from a concrete model to a formula: several activities calculated an answer without making the underlying relationship visible. The history of those ideas was absent.

The shipped additions ask the learner to predict, manipulate a model, and explain the result through immediate mathematical feedback. These are learning activities inside the briefings, before the challenge, without adding scoring or changing progression. Existing calculators and more advanced graphs remain available.

| World and reviewed material | Learning gap | Delivered lab and entry point | Learner action and evidence |
| --- | --- | --- | --- |
| Isla Numérica: operations, order, multiples/divisors, precedence | Multiplication and division were introduced mostly with text; equal groups needed a concrete model. Existing number line, divisor explorer and precedence stepper already support the other topics. | `concept-counting`, `mundo1/operaciones` | Change rows and objects per row. The array, repeated sum and multiplication agree; the mission finds 24 objects and explains inverse division. |
| Reino de las Fracciones: fractions, fraction arithmetic, decimals, percentages | The existing pizza models one fraction, but cannot demonstrate why unlike denominators cannot be added directly. | `concept-fractions`, `mundo2/operar-fracciones` | Repartition fourths and sixths into twelfths without changing colored lengths. Add the equal-sized parts, see the simplified fraction, and represent sums beyond one whole. |
| Volcán de las Potencias: approximation, powers, scientific notation, radicals | The power calculator outputs a result without showing repeated growth or contrasting base × exponent. | `concept-powers`, `mundo3/potenciacion`; study Bloque1 | Change base and number of multiplication steps; compare 3² = 9 with 3 × 2 = 6. The zero step explicitly starts at 1 for nonzero bases. |
| Castillo del Álgebra: MCD, MCM, algebraic fractions, operations, linear equations | “Move to the other side” can become a sign-changing trick without understanding equality. | `concept-algebra`, `mundo4/ecuaciones-lineales`; study Bloque2 | Try x on a physical balance. Remove 3 from both plates, then divide both by 2. x boxes and unit tiles show what each side contains; the solution remains x = 4. The heavier plate tilts down. |
| Laberinto de Sistemas: introduction, graphing, elimination, Cramer | A calculator can obscure why both equations must hold simultaneously. | `concept-systems`, `mundo5/intro-sistemas`; study Bloque3 | Move an integer-coordinate point. A solid and a dashed line, substitution feedback and a mission distinguish satisfying one equation from finding their common intersection (2,4). |
| Estación de Funciones: linear and quadratic functions | Graphs needed a link to input/output and a correct constant-function range. Existing parabola explorer remains useful. | `concept-functions`, `mundo6/funcion-lineal`; study Bloque4 | Manipulate input, slope and intercept. Machine, five-entry table and graph share one rule. The mission requires changing x with slope zero and observing an unchanged output. It resets when the rule changes. |
| Montañas de Geometría: Pitágoras, trigonometry, cylinder, prism | The existing triangle calculator shows side lengths; the area meaning of a² + b² = c² was less visible. | `concept-geometry`, `mundo7/pitagoras`; study Bloque5 | Resize the two perpendicular sides and compare three squares at the same scale. Build 3–4–5 to see 9 + 16 = 25. The initial triangle is 2–3, so the mission needs an action. |
| Feria de Datos: descriptive statistics, percentiles, counting, permutations, combinations, probability | Probability had formulas but no hands-on sample space. The existing statistics chart, box plot, outfit display and counting calculators already visualize their topics. | `concept-probability`, `mundo8/probabilidad`; study Bloque6 | Inspect all 36 ordered pairs of two fair, independent dice. Highlight a target sum, select a pair and compare 6/36 for 7 with 1/36 for 2 or 12. Favorable cells have both color and a ✓. |

The Bloque2 lab supplies a concrete equality model before polynomial operations; it does not replace the existing MCD/MCM lessons. Study pages have their lab immediately after the page introduction. Worlds 1 and 2 have no standalone study pages, so their learning labs are delivered through the game briefings.

## Material correctness repairs

- Replaced the ambiguous rounding question 2.447 → 2.4 with 2.467 → 2.4: truncation now has a distinct result from rounding, which gives 2.5. Updated both the game and study copies.
- Removed the equivalent distractor 0.125 from the question whose correct answer is 1/8 for 2⁻³.
- Reworded the MCD(36,b) question to compare explicit pairs. It no longer implies that 24 and 48 are the only possible values. The explanation states that divisibility by 12 is necessary but does not alone prove the greatest common divisor is 12.
- Replaced overlapping common-factor choices with a single valid maximum numeric cancellation factor.
- Qualified the range of f(x) = mx + b: with real domain and m ≠ 0 it is all real numbers; for m = 0 it is {b}. Added changing feedback to the existing slope widget as well as the lab and both lesson copies. Real-world domains may be restricted.
- Clarified that the radical symbol selects the nonnegative root for even indices; specified the nonnegative-radicand and nonzero-denominator assumptions of the radical property list.
- Fixed the root calculator for negative radicands with odd indices, such as ∛(−8) = −2. Even roots of negative radicands remain outside the real numbers; the index is clamped to integers 2–10.
- Explicitly retained exclusions of zeros of original denominators when simplifying algebraic fractions; added the p + q = b and pq = c conditions beside the quadratic factorization pattern.
- Specified that the favorable/possible probability formula assumes equally likely outcomes.

## Mathematics history delivered alongside the concepts

Every lab has an optional native disclosure headed “Historia de las matemáticas,” a short locally stored historical explanation, a link to the current manipulation, and a clearly attributed source link. The sources open separately, but no network connection is needed for the lessons. These are paraphrases, not copied passages. Ancient mathematics is explicitly distinguished from the modern symbolic notation and models used by the app; the text avoids invention myths or claims of sole authorship.

The historical facts were checked against the University of St Andrews MacTutor archive on 2026-10-12, using the agent-reach Jina reader and direct web reading:

| Lab | Checked historical claim | Source |
| --- | --- | --- |
| Counting | The Rhind papyrus describes multiplying by doubling and adding selected rows. | [Mathematics in Egyptian Papyri](https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_papyri/) |
| Fractions | Egyptian unit fractions and Rhind tables express quantities through sums of parts. | [Mathematics in Egyptian Papyri](https://mathshistory.st-andrews.ac.uk/HistTopics/Egyptian_papyri/) |
| Powers | Babylonian tablets include square tables used in calculation. | [Babylonian mathematics](https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_mathematics/) |
| Algebra | Al-Juarismi's practical algebra treatise and the origin of “álgebra” in al-jabr. The balance is identified as a modern teaching model. | [Al-Khwarizmi](https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/) |
| Systems | Chapter 8 of the Nine Chapters organizes simultaneous equations and eliminates terms. | [Nine Chapters on the Mathematical Art](https://mathshistory.st-andrews.ac.uk/HistTopics/Nine_chapters/) |
| Functions | Descartes' La Géométrie, published in 1637, connected algebra and geometry. | [René Descartes](https://mathshistory.st-andrews.ac.uk/Biographies/Descartes/) |
| Geometry | Old Babylonian tablets contain right-triangle problems predating Pitágoras. The source discusses an actual 3–4–5 example. | [Pythagoras's theorem in Babylonian mathematics](https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_Pythagoras/) |
| Probability | Pascal and Fermat corresponded about chance in 1654 and contributed to the development of probability theory. | [Blaise Pascal](https://mathshistory.st-andrews.ac.uk/Biographies/Pascal/) |

## Accessibility and loading

Each lab is a named region. Controls have associated labels, native keyboard interaction, visible focus styles and touch-sized heights. Text feedback accompanies diagrams; color is supplemented by values, line patterns or checkmarks. Mission results have the accessible name “Resultado de la misión.” Decorative dots are hidden where a labeled complete model is already available. The dice grid uses ordinary labeled buttons rather than a custom keyboard grid.

The labs use responsive SVG and HTML, with no animation or mandatory dragging; reduced-motion users receive the same interactions. SVG boards intentionally retain a light background so their fixed diagram inks stay legible in either theme. Favorable dice cells and x boxes retain dark indigo backgrounds with white text to avoid the global dark palette's lighter indigo inversion.

The widget registry keeps React.lazy for all existing and new activities. The eight small labs share a deferred module, use no chart libraries, and add no dependencies. Study imports are behind the root's lazy study-page boundary. Production bundle measurement and real-browser verification belong to the root integration gates.

## Four implementation passes and verification

1. Implemented all eight labs, historical notes, briefing entries and six study entries.
2. Reviewed the mathematical models and repaired ambiguous multiple-choice questions, constant-function range and negative odd roots.
3. Checked integration and mathematical assumptions, tested negative controls for incomplete missions, preserved equality through operations and repartitioning, and corrected the balance tilt direction.
4. Polished accessible mission names, reset behavior, simplified fractions, theme contrast and source links. A final read found no remaining defect in the delivered labs.

Focused command: `npx vitest run src/components/__tests__/conceptLabs.test.jsx src/content/__tests__/validateContent.test.js`. Result: 21 tests passed across 2 files (13 new interaction/integration checks and 8 existing content validation checks). The tests exercise multiple quantities, preserve equalities, distinguish one satisfied constraint from two, observe constant outputs after actual input changes, contrast favorable dice outcomes, test negative odd/even radicals, and independently evaluate the repaired MCD options.

Source lint includes all changed lesson files, the registry, the new components/data/tests, and the modified legacy slope/root widgets. Final executable evidence is recorded in `.unlazy/mathquest-polish/gates/leaf-courses.md`; the root independently verifies production behavior and the bundle budget.
