# Vista del Log de Orden

La *Vista del Log de Orden* ofrece un log en ejecución que se actualiza cada 2-3 segundos. Esto permite seguir la salida de Jobs e instrucciones de Workflow ejecutadas por la Orden casi en tiempo real.

## Filtro

La *Vista del Log de Orden* ofrece filtrado por varios criterios disponibles en la parte superior de la ventana:

- **Principal** especifica que se mostrarán los detalles sobre los inicios de Órdenes, los inicios de Jobs y la parametrización en los inicios de Jobs. Dicha salida se indica con el calificador [MAIN].
- Los eventos de **Éxito** se indican con el calificador [SUCCESS] y muestran detalles como la parametrización resultante cuando se completan los Jobs.
- **stdout** especifica si la salida escrita por los Jobs al canal stdout se mostrará usando el calificador [STDOUT].
- **Debug** aplica a Jobs JVM que hacen uso de la [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). A dichos Jobs se les puede agregar el argumento *log_level* con el valor *debug* o *trace*. Si hay salida de depuración disponible en un Job, se mostrará usando el calificador [DEBUG].
- **Detalle** especifica si se mostrarán los eventos creados por instrucciones de Workflow como la publicación y espera de Avisos.

La salida del log escrita por los Jobs al canal stderr no está sujeta a filtrado y se mostrará con el calificador [STDERR].

## Visualización de la Salida del Log

### Panel de Log

La salida del log se muestra en orden histórico de llegada. Si un Workflow bifurca la ejecución a Jobs paralelos, la salida de cada Job se mostrará de forma coherente.

La parte superior de la ventana ofrece los iconos de chevron hacia abajo y chevron hacia arriba que expanden o contraen la salida del log de cualquier Job.

#### Marcas de Tiempo

La salida del log indica marcas de tiempo de diferentes fuentes:

- **Hora del Agente**: Los eventos principales iniciales como *OrderStarted* son creados por el Agente y reflejan el reloj en tiempo real del Agente.
- **Hora del Job**: La salida de los Jobs usa la zona horaria del servidor en el que se ejecutará el Job o la zona horaria especificada en la implementación del Job.
- **Hora del Controlador**: Los eventos finales como *OrderFinished* son creados por el Controlador y reflejan el reloj en tiempo real del Controlador.

La *Vista del Log de Orden* convierte las marcas de tiempo a la zona horaria del usuario, si el ajuste correspondiente en [Perfil - Preferencias](/profile-preferences) está activo. De lo contrario, se usarán las zonas horarias del Controlador y del Agente.

Si los relojes en tiempo real del Controlador y del Agente no están sincronizados, esto puede resultar en una salida del log que sugiere viajes en el tiempo.

### Panel de Navegación

En el lado derecho de la ventana, los usuarios encuentran un icono de flecha izquierda que muestra el panel de navegación.

El panel ofrece el orden histórico de Jobs e instrucciones de Workflow ejecutadas por la Orden. El color rojo indica Jobs e instrucciones de Workflow fallidos.

Hacer clic en un Job o instrucción de Workflow en el panel de navegación salta a la salida del log relacionada en el panel de log.

## Referencias

- [Perfil - Preferencias](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
