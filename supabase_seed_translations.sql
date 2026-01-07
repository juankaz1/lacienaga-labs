-- ============================================================================
-- Seed de traducciones (title_translated / abstract_translated)
-- ============================================================================
-- Ejecuta en Supabase -> SQL Editor.
-- Esto NO cambia el idioma original del paper; solo llena los campos *_translated
-- para que el selector ES/EN en blog.html funcione.
-- ============================================================================

-- A1 (EN -> ES)
UPDATE public.papers
SET
  title_translated = COALESCE(NULLIF(title_translated, ''), 'La termodinámica local gobierna la formación y disolución de condensados de gránulos P de Caenorhabditis elegans'),
  abstract_translated = COALESCE(NULLIF(abstract_translated, ''), 'Los compartimentos sin membrana, también conocidos como condensados, proporcionan entornos químicamente distintos y organizan espacialmente la célula. Un ejemplo bien estudiado de condensados son los gránulos P en el nematodo Caenorhabditis elegans que juegan un papel importante en el desarrollo de la línea germinal. Los gránulos P son condensados de proteínas ricos en ARN que comparten las propiedades clave de las gotas líquidas como una forma esférica, la capacidad de fusionarse y la difusión rápida de sus componentes moleculares. Una pregunta pendiente es hasta qué punto la separación de fases en equilibrio termodinámico es apropiada para describir la formación de condensados en un ambiente celular activo. Para abordar esta pregunta, investigamos la respuesta de los condensados de gránulos P en células vivas a los cambios de temperatura. Observamos que los gránulos P se disuelven al aumentar la temperatura y se recondensan al bajar la temperatura de manera reversible. Sorprendentemente, esta respuesta a la temperatura puede ser capturada por diagramas de fases in vivo que están bien descritos por un modelo de Flory-Huggins en equilibrio termodinámico. Este hallazgo es sorprendente debido a los procesos activos en una célula viva. Para abordar el impacto de tales procesos activos en la separación de fases intracelular, discutimos las heterogeneidades de temperatura. Mostramos que, para estimaciones típicas de la densidad de procesos activos, la temperatura representa una variable bien definida y que los elementos de volumen mesoscópicos están en equilibrio termodinámico local. Nuestros hallazgos proporcionan evidencia sólida de que el ensamblaje y desensamblaje de gránulos P están gobernados por la separación de fases basada en equilibrios térmicos locales donde la naturaleza de no equilibrio del citoplasma se manifiesta en escalas más grandes.')
WHERE slug = 'local-thermodynamics-p-granules-condensates';

-- A2 (EN -> ES)
UPDATE public.papers
SET
  title_translated = COALESCE(NULLIF(title_translated, ''), 'La temperatura impulsa la formación de gránulos P en Caenorhabditis elegans'),
  abstract_translated = COALESCE(NULLIF(abstract_translated, ''), 'Los ectotermos son criaturas vivas cuya temperatura corporal varía con el ambiente en el que viven. Su fisiología y metabolismo deben responder rápidamente a los cambios ambientales para mantenerse viables en todo su rango térmico tolerable. En nematodos como Caenorhabditis elegans, la temperatura es un factor importante que define la fertilidad del gusano. Una característica que delimita el rango térmico de un ectotermo es la temperatura máxima a la que su línea germinal puede producir gametos. Cómo las células germinales resisten factores estresantes ambientales altos como temperaturas limitantes no se entiende bien, especialmente cuando se consideran los principios termodinámicos que dominan los procesos bioquímicos del citoplasma. Estudios previos en C. elegans han mostrado que los efectos termodinámicos de la temperatura en la tasa del ciclo celular en nematodos sigue una relación de Arrhenius y define el rango térmico donde los gusanos pueden ser fértiles. En los límites de esta relación se observa una ruptura de la tendencia de Arrhenius. Se hipotetizó que algún tipo de transición de fase discontinua ocurrió en las células embrionarias de C. elegans. Sin embargo, permanece desconocido si hay un vínculo fisiológico entre una caída en la fertilidad y la ruptura embrionaria de la tendencia de Arrhenius. Este trabajo encuentra el vínculo entre una separación de fases de gránulos P impulsada por temperatura y la fertilidad. Los gránulos P son importantes para el desarrollo de la línea germinal y la fertilidad de C. elegans. Aquí se muestra que los gránulos P se mezclan con el citoplasma tras un enfriamiento de temperatura de 27ºC a T=18ºC y se desmezclan del citoplasma formando gotas tras una disminución de temperatura de 18ºC a 27ºC. Los gránulos P también muestran un comportamiento reversible mezclándose y desmezclándose con cambios en la temperatura in vivo, teniendo una fuerte dependencia de estos compartimentos tipo líquido con la entropía.')
WHERE slug = 'temperature-drives-p-granule-formation';

-- A3 (EN -> ES)
UPDATE public.papers
SET
  title_translated = COALESCE(NULLIF(title_translated, ''), 'Inmunogenicidad y seguridad de una vacuna RBD contra SARS‑CoV‑2 en un modelo murino'),
  abstract_translated = COALESCE(NULLIF(abstract_translated, ''), 'Introducción: Aunque más de la mitad de la población mundial ya está vacunada, la aparición de nuevas variantes de preocupación pone en riesgo la salud pública debido a la generación de nuevos inmunógenos contra el virus como una estrategia crucial y relevante en el control de estas nuevas variantes. Métodos: Un estudio preclínico utilizó un candidato a vacuna potencial (RBD, SARS-CoV-2). Se utilizaron cuatro grupos de ratones BALB/c, un grupo control, un grupo adyuvante, un grupo inoculado con una dosis de proteína de subunidad RBD, y el cuarto grupo inoculado con dos dosis de proteína de subunidad RBD. Resultados: No se mostraron cambios inflamatorios o celulares en la evaluación anatomopatológica de los ratones. Se obtuvieron cinéticas más altas y 75% de seroconversión en los ratones inoculados con dos dosis de RBD (P < 0.0001). Conclusiones: La aplicación de dos dosis del candidato a vacuna RBD en ratones BALB/c demostró ser segura e inmunogénica contra SARS-CoV-2.')
WHERE slug = 'immunogenicity-safety-rbd-vaccine-sars-cov2';

-- J1 (ES -> EN) (por si faltara algo)
UPDATE public.papers
SET
  title_translated = COALESCE(NULLIF(title_translated, ''), 'Characterization of genetic circuit architectures from analytical and stochastic models'),
  abstract_translated = COALESCE(NULLIF(abstract_translated, ''), 'Designing a new genetic circuit requires determining not only the response of each of its parts, but also the choice of a biological implementation. In this paper we analyze three of the simplest and most common genetic regulation architectures in terms of their stabilization times, production ranges and intrinsic noise from analytical descriptions and stochastic simulations. We propose a framework for comparing the models and illustrate them for a possible range of parameters for the different circuits. We propose a new way to check deterministic solutions of systems based on convolution algebra, and an analytical approach to the complete solution of the stochastic behavior of them. This study serves as the basis, and illustrates some necessary considerations, for the choice of the most viable architecture according to specific requirements of a genetic circuit.')
WHERE slug = 'caracterizacion-arquitecturas-circuitos-geneticos';

-- J2 (ES -> EN)
UPDATE public.papers
SET
  title_translated = COALESCE(NULLIF(title_translated, ''), 'Analytical solutions to gene expression systems with negative feedback'),
  abstract_translated = COALESCE(NULLIF(abstract_translated, ''), 'The analysis of gene expression systems in unicellular organisms is a topic of importance, as it is the theoretical study pathway available for understanding the internal functioning of these organisms. Computational models and predictions are generated in multiple laboratories around the globe based on these systems. However, apart from experimentation and computational modeling, this is an area of study that has been somewhat stalled by the lack of mathematical formalization and quantifiable theoretical development. This is where the use of quantification methods and the study of random processes becomes useful, such as those proposed by information theory and the master equation method. The development of the method under the desired order of accuracy (through approximations in series expansions) makes it an innovative and effective tool for the analytical study of gene expression systems.')
WHERE slug = 'soluciones-analiticas-sistemas-expresion-genes-feedback';

-- R1 (ES -> EN)
UPDATE public.papers
SET
  title_translated = COALESCE(NULLIF(title_translated, ''), 'Diversity of mycorrhizal fungi in lianas and in the rhizosphere of phorophytes in a forest relic in Córdoba, Colombia'),
  abstract_translated = COALESCE(NULLIF(abstract_translated, ''), 'Mycorrhizae are a symbiotic association found in 90% of plants between a fungus and their roots. Among their evolutionary and ecological advantages are resistance to pathogens, facilitation of nutrient absorption, and water exchange. On the other hand, lianas are a type of plant whose growth is directly related to another plant as a support mechanism, for which they have morphological modifications in their leaves and stems. The objective of this study is to understand and compare the diversity associated with the rhizosphere of lianas of the genus Schnella and their host plants in a forest relic in Córdoba.')
WHERE slug = 'diversidad-hongos-micorrizicos-lianas-cordoba';


