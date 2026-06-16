# Configuración - Inventario - Navegación

La vista *Configuración - Inventario* se utiliza para gestionar objetos de inventario como Workflows, Planificaciones, etc.

- El *Panel de Navegación* ofrece navegación por Etiquetas y carpetas. Además, ofrece operaciones sobre objetos de inventario.
- El *Panel de Objetos* contiene la representación del objeto relacionado, por ejemplo [Configuración - Inventario - Workflows](/configuration-inventory-workflows).

## Panel de Navegación

El panel izquierdo está organizado en pestañas que permiten la navegación por carpetas y por Etiquetas para Workflows y Jobs.

- La navegación por **Carpeta** mostrará los objetos de inventario de la carpeta seleccionada.
- El filtrado por Etiquetas se ofrece desde las siguientes pestañas para seleccionar Workflows:
  - **Etiquetas de Workflow** se asignan desde la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows) a nivel de Workflow.
  - **Etiquetas de Job** se asignan desde la misma vista a nivel de Job.

### Carpetas

Por defecto, las *Carpetas de Inventario* se muestran por tipo de objeto de planificación. Los usuarios pueden crear sus propias carpetas en cualquier nivel de jerarquía. El mismo nombre de *Carpeta de Usuario* puede aparecer cualquier número de veces en diferentes niveles de la jerarquía de carpetas.

La jerarquía de carpetas reconoce los siguientes tipos de carpetas:

- Las **Carpetas de Inventario** contienen los siguientes tipos de objetos:
  - Los objetos de **Controlador** se despliegan en un Controlador y en los Agentes:
    - Los [Workflows](/configuration-inventory-workflows) incluyen Jobs y otras Instrucciones de Workflow. Para más detalles véase [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows).
    - Las [Órdenes Disparadas por Archivo](/configuration-inventory-file-order-sources) se usan para la vigilancia de archivos con el fin de iniciar automáticamente Workflows cuando llega un archivo a un directorio. Para más detalles véase [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching).
    - Los [Recursos de Job](/configuration-inventory-job-resources) se usan para centralizar la configuración de variables que se reutilizan en varios Jobs. Para más detalles véase [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources).
    - Los [Tableros de Avisos](/configuration-inventory-notice-boards) especifican dependencias entre Workflows. Para más detalles véase [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).
    - Los [Recursos de Lock](/configuration-inventory-resource-locks) limitan la ejecución paralela de Jobs y otras instrucciones. Para más detalles véase [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks).
  - Los objetos de **Automatización** se usan para la automatización en JOC Cockpit:
    - Los [Scripts Incluidos](/configuration-inventory-script-includes) son fragmentos de código que pueden reutilizarse en varios Jobs de Shell. Para más detalles véase [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).
    - Las [Planificaciones](/configuration-inventory-schedules) determinan el momento en que comenzarán las Órdenes para la ejecución del Workflow. Se asignan a uno o más Workflows y opcionalmente a Variables de Orden utilizadas por los Jobs del Workflow dado. Hacen uso de uno o más *Calendarios*. Para más detalles véase [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).
    - Los [Calendarios](/configuration-inventory-calendars) especifican los días en que pueden ocurrir eventos de planificación. Contienen reglas para días recurrentes y listas de días que son utilizadas por las *Planificaciones* para crear Órdenes para la ejecución de Workflows con el [Plan Diario](/daily-plan). Para más detalles véase [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).
    - Las [Plantillas de Job](/configuration-inventory-job-templates) son proporcionadas por las Plantillas de Job del usuario o por clases Java que se distribuyen con JS7 y pueden usarse en cualquier plataforma de SO. Para más detalles véase [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates).
    - Los [Reportes](/configuration-inventory-reports) resumen los resultados de ejecución de Workflows y Jobs para períodos determinados. Para más detalles véase [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports).
- Las **Carpetas de Usuario** son creadas por el usuario en cualquier nivel de jerarquía. Cada *Carpeta de Usuario* contendrá un conjunto de *Carpetas de Inventario*.

#### Búsqueda Rápida de Objetos

A la derecha de la carpeta de nivel superior en el *Panel de Navegación*, los usuarios encontrarán un Ícono de Búsqueda que puede usarse para localizar objetos de inventario.

- Se deben ingresar al menos dos caracteres para que la Búsqueda Rápida encuentre objetos que comiencen con dichos caracteres.
- La Búsqueda Rápida no distingue mayúsculas de minúsculas y aplica truncamiento por la derecha.
- La Búsqueda Rápida devuelve objetos con nombres coincidentes por categoría, como Workflows y Planificaciones.
- El metacarácter \\* puede usarse como comodín para cero o más caracteres:
  - **\\*test** encontrará los objetos ***test**Inicial*, *mi**Test***
  - **te\\*st** encontrará los objetos ***test**Inicial*, ***te**rminar**St**atus*

#### Papelera de Objetos

Cuando los objetos de inventario son eliminados, se envían a la Papelera. La Papelera permite restaurar objetos y eliminarlos permanentemente.

La Papelera se abre desde el Ícono de Papelera ubicado a la derecha de la carpeta de nivel superior en el *Panel de Navegación*.

- Hacer clic en el Ícono de Papelera cambiará la vista para mostrar los objetos en la Papelera. Se ofrece el Ícono de Retorno para volver de la vista de Papelera a la vista de inventario.
- La estructura de carpetas de la Papelera es la misma que para los objetos de inventario.
- La Papelera ofrece menús de acciones por objeto y por carpeta para restaurar objetos y eliminarlos permanentemente.

### Etiquetas

Las Etiquetas se consideran una forma alternativa de navegar entre objetos de inventario. Al activar las pestañas *Etiquetas de Workflow* o *Etiquetas de Job* en el *Panel de Navegación*, el panel muestra la lista de Etiquetas disponibles.

Las Etiquetas pueden agregarse desde el ícono +. Están disponibles opciones de orden ascendente y descendente. La visualización de Etiquetas en otras vistas debe activarse desde la página [Configuración - JOC Cockpit](/settings-joc).

- Al hacer clic en la Etiqueta correspondiente se mostrarán los Workflows que tienen asignada dicha Etiqueta.
- Las Etiquetas ofrecen las siguientes operaciones desde su menú de acciones de 3 puntos:
  - **Renombrar** permite modificar el nombre de la Etiqueta.
  - **Eliminar** permite eliminar la Etiqueta y su asignación a Workflows y Jobs.

## Operaciones

Las operaciones están disponibles a nivel de carpeta y a nivel de objeto desde el menú de acciones de 3 puntos mostrado en el *Panel de Navegación*.

### Operaciones a Nivel de Carpeta

Las operaciones están disponibles para *Carpetas de Inventario* y *Carpetas de Usuario*.

La carpeta de nivel superior / (barra diagonal) ofrece las siguientes operaciones:

- **Re-desplegar** se usa en caso de pérdida del Diario si la memoria de un Controlador se borra y el Controlador se inicializa. La operación *desplegará* todos los objetos que hayan sido previamente desplegados en un Controlador.
- **Actualizar Dependencias** recrea la representación interna de las dependencias de objetos. Esto ocurre automáticamente y se activa al crear o eliminar objetos de inventario y en caso de cambios en los nombres de los objetos. Si los usuarios tienen razones para suponer que las dependencias no están sincronizadas, se puede realizar esta operación. Los usuarios deben tener en cuenta que esto llevará tiempo, aproximadamente tres minutos para un inventario de 5000 objetos. Sin embargo, los usuarios pueden continuar trabajando con JOC Cockpit mientras se actualizan las dependencias.

#### Operaciones en Carpetas de Inventario

Las siguientes operaciones están disponibles para las *Carpetas de Inventario*:

- Operaciones sobre Objetos de Controlador
  - *Workflows*
    - **Nuevo** crea un Workflow.
    - **Renombrar** permite renombrar un workflow. Se considerarán las dependencias de objetos y los objetos de inventario que lo referencien, como *Planificaciones* y *Órdenes Disparadas por Archivo*, tendrán el nombre actualizado. El Workflow y los objetos que lo referencian se pondrán en estado *borrador*. Para más detalles véase [Renombrar Carpeta](/configuration-inventory-operations-rename-folder).
    - **Administrar Etiquetas** permite agregar y eliminar Etiquetas a/de los Workflows en la carpeta, véase [Administrar Etiquetas](/configuration-inventory-operations-manage-tags).
    - **Exportar** permite crear un archivo de exportación en formato .zip o .tar.gz que contiene la jerarquía de carpetas y la representación JSON de los Workflows. Para más detalles véase [Exportar Carpeta](/configuration-inventory-operations-export-folder).
    - **Repositorio Git** ofrece integración con un servidor Git. Los Workflows pueden confirmarse en repositorios Git y pueden descargarse y enviarse. Para más detalles véase [Git - Clonar Repositorio](/configuration-inventory-operations-git-clone).
    - **Cambio** ofrece operaciones de gestión de cambios para Workflows. Los usuarios pueden agregar un Workflow en construcción a un *Cambio* que permite el despliegue y exportación conjunta de objetos modificados. Para más detalles véase [Cambios](/changes).
    - **Desplegar** hará que los Workflows estén disponibles para el Controlador y los Agentes. Los Workflows se pondrán en estado *desplegado*. Para más detalles véase [Desplegar Carpeta](/configuration-inventory-operations-deploy-folder).
    - **Revocar** revierte una operación de *Despliegue* anterior. Los Workflows se pondrán en estado *borrador*. Esto implica que las Órdenes de los Workflows serán eliminadas del [Plan Diario](/daily-plan). Se consideran las dependencias de objetos y los objetos que los referencian, como *Planificaciones* y *Órdenes Disparadas por Archivo*, también serán revocados/recuperados. Para más detalles véase [Revocar Carpeta](/configuration-inventory-operations-revoke-folder).
    - **Eliminar** moverá los Workflows a la Papelera. Los Workflows eliminados pueden restaurarse o eliminarse permanentemente desde la Papelera. Para más detalles véase [Eliminar Carpeta](/configuration-inventory-operations-remove-folder).
    - **Revertir Borrador** eliminará la versión borrador actual de los Workflows. Si existe una versión previamente *desplegada*, ésta se convertirá en la versión actual del Workflow correspondiente.
    - **Actualizar Jobs desde Plantillas** actualizará los Jobs de los Workflows ubicados en la *Carpeta de Inventario* seleccionada a partir de las *Plantillas de Job* ubicadas en cualquier carpeta.
  - *Órdenes Disparadas por Archivo*, *Recursos de Job*, *Tableros de Avisos*, *Recursos de Lock* ofrecen operaciones similares a las de *Workflows*.
- Operaciones sobre Objetos de Automatización
  - **Liberar** hace que los objetos en estado *borrador* estén disponibles:
    - para uso con otros objetos, por ejemplo los *Scripts Incluidos* se considerarán para el próximo despliegue de Workflows, las *Plantillas de Job* pueden actualizarse en los Workflows que las referencian.
    - para uso con el [Plan Diario](/daily-plan), por ejemplo las *Planificaciones* serán consideradas para la creación de Órdenes.
    - para más detalles véase [Liberar Carpeta](/configuration-inventory-operations-release-folder).
  - **Recuperar** revierte una operación de *Liberación* anterior. Los objetos de inventario se pondrán en estado *borrador*. Esto implica que las *Planificaciones* y *Calendarios* en borrador no serán considerados por el [Plan Diario](/daily-plan). La operación considera las dependencias de objetos y también recuperará/revocará los objetos que los referencian. Para más detalles véase [Recuperar Carpeta](/configuration-inventory-operations-recall-folder).
  - **Aplicar Plantilla a Jobs** actualizará los Jobs de los Workflows ubicados en cualquier carpeta que tengan referencias a las *Plantillas de Job* incluidas en la *Carpeta de Inventario* seleccionada o en cualquier subcarpeta.
  - Otras operaciones están disponibles de manera similar a las *Operaciones sobre Objetos de Controlador*.

#### Operaciones en Carpetas de Usuario

Las *Carpetas de Usuario* son creadas por los usuarios y contienen un conjunto de *Carpetas de Inventario*. Se ofrecen las siguientes operaciones:

- Operaciones sobre todos los Objetos
  - **Nuevo** crea el objeto ofrecido desde los elementos del menú de acciones: una carpeta o un objeto de inventario, véase [Reglas de Nomenclatura de Objetos](/object-naming-rules).
  - **Cortar** *cortará* la carpeta, cualquier subcarpeta y los objetos de inventario para pegarlos posteriormente en una ubicación diferente en la jerarquía de carpetas.
  - **Copiar** *copiará* la carpeta, cualquier subcarpeta y los objetos de inventario, incluyendo los objetos de inventario referenciados que puedan estar ubicados en otras carpetas. La operación es una *copia profunda* que trabaja sobre cualquier objeto referenciado.
  - **Copia Superficial** *copiará* la carpeta, cualquier subcarpeta y los objetos de inventario. No se consideran las referencias a objetos de inventario en otras carpetas.
  - **Renombrar** permite renombrar la carpeta y opcionalmente los objetos de inventario incluidos. Para más detalles véase [Renombrar Carpeta](/configuration-inventory-operations-rename-folder).
  - **Administrar Etiquetas** permite agregar y eliminar Etiquetas a/de los Workflows en la jerarquía de carpetas dada, véase [Administrar Etiquetas](/configuration-inventory-operations-manage-tags).
  - **Exportar** permite crear un archivo de exportación en formato .zip o .tar.gz que contiene la jerarquía de carpetas y la representación JSON de los objetos de inventario incluidos. Para más detalles véase [Exportar Carpeta](/configuration-inventory-operations-export-folder).
  - **Repositorio Git** ofrece integración con un servidor Git. Los objetos de inventario pueden confirmarse en repositorios Git y pueden descargarse y enviarse. Para más detalles véase [Git - Clonar Repositorio](/configuration-inventory-operations-git-clone).
  - **Cambio** ofrece operaciones de gestión de cambios para objetos de inventario. Los usuarios pueden agregar objetos como Workflows en construcción a un *Cambio* que permite el despliegue y exportación conjunta de objetos modificados. Para más detalles véase [Cambios](/changes).
- Operaciones sobre Objetos de Controlador
  - **Desplegar** hará que los objetos estén disponibles para el Controlador y los Agentes. Los objetos de inventario se pondrán en estado *desplegado*. Para más detalles véase [Desplegar Carpeta](/configuration-inventory-operations-deploy-folder).
  - **Revocar** revierte una operación de *Despliegue* anterior. Los objetos de inventario se pondrán en estado *borrador*. Esto implica que las Órdenes de los Workflows serán eliminadas del [Plan Diario](/daily-plan). Para más detalles véase [Revocar Carpeta](/configuration-inventory-operations-revoke-folder).
  - **Revalidar** verifica la validez de los objetos de inventario que pueden volverse inconsistentes, por ejemplo tras la importación de objetos.
  - **Sincronizar** pondrá en sincronía el estado de los objetos de planificación con el Controlador y el inventario:
    - *Sincronizar con el Controlador* *Desplegará* o *Revocará* los objetos de inventario hacia/desde el Controlador y los Agentes según su estado *desplegado* o *borrador* en el inventario. La operación puede usarse en caso de pérdida del Diario cuando la memoria del Controlador se borra y el Controlador se inicializa.
    - *Sincronizar con el Inventario* pondrá los objetos de inventario en estado *desplegado* o *borrador* según la disponibilidad del objeto en el Controlador.
- Operaciones sobre Objetos de Automatización
  - **Liberar** hace que los objetos en estado *borrador* estén disponibles:
    - para uso con otros objetos, por ejemplo los *Scripts Incluidos* se considerarán para el próximo despliegue de Workflows, las *Plantillas de Job* pueden actualizarse en los Workflows que las referencian.
    - para uso con el [Plan Diario](/daily-plan), por ejemplo las *Planificaciones* serán consideradas para la creación de Órdenes.
    - para más detalles véase [Liberar Carpeta](/configuration-inventory-operations-release-folder).
  - **Recuperar** revierte una operación de *Liberación* anterior. Los objetos de inventario se pondrán en estado *borrador*. Esto implica que las *Planificaciones* y *Calendarios* en borrador no serán considerados por el [Plan Diario](/daily-plan). Para más detalles véase [Recuperar Carpeta](/configuration-inventory-operations-recall-folder).
- Operaciones de Eliminación
  - **Eliminar** moverá la carpeta, cualquier subcarpeta y los objetos incluidos a la Papelera. Los objetos de inventario eliminados pueden restaurarse o eliminarse permanentemente desde la Papelera. Para más detalles véase [Eliminar Carpeta](/configuration-inventory-operations-remove-folder).
  - **Revertir Borrador** eliminará la versión borrador actual de los objetos en la carpeta y cualquier subcarpeta. Si existe una versión previamente *desplegada* o *liberada*, ésta se convertirá en la versión actual del objeto correspondiente.
- Operaciones de Plantillas de Job
  - **Actualizar Jobs desde Plantillas** actualizará los Jobs de los Workflows ubicados en cualquier carpeta que tengan referencias a las *Plantillas de Job* incluidas en la *Carpeta de Usuario* seleccionada o en cualquier subcarpeta.
  - **Aplicar Plantilla a Jobs** actualizará los Jobs de los Workflows ubicados en la *Carpeta de Usuario* seleccionada a partir de las *Plantillas de Job* ubicadas en cualquier carpeta.

### Operaciones a Nivel de Objeto

Las siguientes operaciones se ofrecen para objetos de inventario individuales:

- Todos los Objetos
  - **Cortar** *cortará* el objeto para pegarlo posteriormente en una ubicación diferente en la jerarquía de carpetas.
  - **Copiar** *copiará* el objeto para pegarlo posteriormente.
  - **Renombrar** permite modificar el nombre del objeto. Se considerarán las dependencias de objetos y los objetos de inventario que lo referencien tendrán el nombre actualizado. El objeto renombrado y los objetos que lo referencian se pondrán en estado *borrador*. Para más detalles véase [Renombrar Objeto](/configuration-inventory-operations-rename-object).
  - **Cambio** ofrece operaciones de gestión de cambios para objetos de inventario. Los usuarios pueden agregar objetos como Workflows en construcción a un *Cambio* que permite el despliegue y exportación conjunta de objetos modificados. Para más detalles véase [Cambios](/changes).
  - **Mostrar Dependencias** muestra la lista de objetos que lo referencian y los objetos referenciados. Por ejemplo, un Workflow puede tener referencias a Recursos de Job y puede ser referenciado por *Planificaciones* u *Órdenes Disparadas por Archivo*.
  - **Nuevo Borrador** crea una versión borrador a partir de una versión previamente *desplegada* o *liberada* del objeto.
  - Operaciones JSON
    - **Mostrar JSON** muestra el formato de almacenamiento JSON del objeto de inventario.
    - **Editar JSON** permite modificar un objeto directamente desde su formato de almacenamiento JSON.
    - **Descargar JSON** descargará el objeto en formato de almacenamiento JSON a un archivo .json.
    - **Subir JSON** permite subir un archivo .json que reemplazará el objeto.
  - Operaciones de Eliminación
    - **Eliminar** moverá el objeto a la Papelera. Los objetos de inventario eliminados pueden restaurarse o eliminarse permanentemente desde la Papelera. Para más detalles véase [Eliminar Objeto](/configuration-inventory-operations-remove-object).
    - **Revertir Borrador** eliminará la versión borrador actual del objeto. Si existe una versión previamente *desplegada* o *liberada*, ésta se convertirá en la versión actual del objeto.
- Objetos de Controlador
  - **Administrar Etiquetas** está disponible para Workflows y permite agregar y eliminar Etiquetas al/del Workflow.
  - **Desplegar** hará que el objeto esté disponible para el Controlador y los Agentes. El objeto se pondrá en estado *desplegado*. El despliegue considera las dependencias de objetos referenciados y referenciadores. Para más detalles véase [Desplegar Objeto](/configuration-inventory-operations-deploy-object).
  - **Revocar** revierte una operación de *Despliegue* anterior. El objeto se pondrá en estado *borrador*. Para su uso con Workflows esto implica que las Órdenes serán eliminadas del [Plan Diario](/daily-plan). Para más detalles véase [Revocar Objeto](/configuration-inventory-operations-revoke-object).
- Objetos de Automatización
  - **Liberar** hace que los objetos en estado *borrador* estén disponibles:
    - para uso con otros objetos, por ejemplo los *Scripts Incluidos* se considerarán para el próximo despliegue de Workflows, las *Plantillas de Job* pueden actualizarse en los Workflows que las referencian.
    - para uso con el [Plan Diario](/daily-plan), por ejemplo las *Planificaciones* serán consideradas para la creación de Órdenes.
    - para más detalles véase [Liberar Objeto](/configuration-inventory-operations-release-object).
  - **Recuperar** revierte una operación de *Liberación* anterior. Los objetos de inventario se pondrán en estado *borrador*. Esto implica que las *Planificaciones* y *Calendarios* en borrador no serán considerados por el [Plan Diario](/daily-plan). Para más detalles véase [Recuperar Objeto](/configuration-inventory-operations-recall-object).

## Referencias

### Ayuda Contextual

- [Cambios](/changes)
- [Plan Diario](/daily-plan)
- [Reglas de Nomenclatura de Objetos](/object-naming-rules)
- Objetos de Controlador
  - [Workflows](/configuration-inventory-workflows)
  - [Órdenes Disparadas por Archivo](/configuration-inventory-file-order-sources)
  - [Recursos de Job](/configuration-inventory-job-resources)
  - [Tableros de Avisos](/configuration-inventory-notice-boards)
    - [Recursos - Tableros de Avisos](/resources-notice-boards)
  - [Recursos de Lock](/configuration-inventory-resource-locks)
    - [Recursos - Recursos de Lock](/resources-resource-locks)
- Objetos de Automatización
  - [Scripts Incluidos](/configuration-inventory-script-includes)
  - [Planificaciones](/configuration-inventory-schedules)
  - [Calendarios](/configuration-inventory-calendars)
  - [Plantillas de Job](/configuration-inventory-job-templates)
  - [Reportes](/configuration-inventory-reports)
- Operaciones sobre Objetos
  - [Desplegar Objeto](/configuration-inventory-operations-deploy-object)
  - [Revocar Objeto](/configuration-inventory-operations-revoke-object)
  - [Liberar Objeto](/configuration-inventory-operations-release-object)
  - [Recuperar Objeto](/configuration-inventory-operations-recall-object)
  - [Eliminar Objeto](/configuration-inventory-operations-remove-object)
  - [Renombrar Objeto](/configuration-inventory-operations-rename-object)
- Operaciones en Carpetas de Usuario
  - [Desplegar Carpeta](/configuration-inventory-operations-deploy-folder)
  - [Revocar Carpeta](/configuration-inventory-operations-revoke-folder)
  - [Liberar Carpeta](/configuration-inventory-operations-release-folder)
  - [Recuperar Carpeta](/configuration-inventory-operations-recall-folder)
  - [Eliminar Carpeta](/configuration-inventory-operations-remove-folder)
  - [Renombrar Carpeta](/configuration-inventory-operations-rename-folder)
  - [Exportar Carpeta](/configuration-inventory-operations-export-folder)
  - [Git - Clonar Repositorio](/configuration-inventory-operations-git-clone)
  - [Administrar Etiquetas](/configuration-inventory-operations-manage-tags)

### Base de Conocimiento del Producto

- Objetos de Controlador
  - [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
  - [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
  - [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources)
  - [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
- Objetos de Automatización
  - [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
  - [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
  - [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
    - [JS7 - Management of Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Calendars)
  - [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
