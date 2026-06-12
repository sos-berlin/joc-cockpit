# Vista de Log de Tarea

La *Vista de Log de Tarea* ofrece un log en ejecución que se actualiza cada 2-3 segundos. Esto permite seguir la salida de Jobs en tiempo casi real.

## Filtro

La *Vista de Log de Tarea* ofrece filtrado a partir de varios criterios disponibles en la parte superior de la ventana:

- **Main** especifica que se mostrarán detalles sobre el inicio del Job y la parametrización en el inicio del Job. Dicha salida se indica con el calificador [MAIN].
- **stdout** especifica si la salida escrita por el Job al canal stdout se mostrará usando el calificador [STDOUT].
- **Debug** aplica a Jobs de JVM que hacen uso de la [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). A dichos Jobs se les puede agregar el argumento *log_level* con el valor *debug* o *trace*. Si hay salida de depuración disponible de un Job, se mostrará usando el calificador [DEBUG].

La salida de log escrita por los Jobs al canal stderr no está sujeta a filtrado y se mostrará con el calificador [STDERR].

## Panel de Log

La salida de log se muestra en orden histórico de llegada.

### Marcas de Tiempo

La salida de log indica marcas de tiempo de diferentes fuentes:

- **Hora del Agente**: Los eventos como *Inicio* y *Fin* son creados por el Agente y reflejan el reloj en tiempo real del Agente.
- **Hora del Job**: La salida de los Jobs utiliza la zona horaria del servidor en el que se ejecutará el Job o la zona horaria especificada por la implementación del Job.

La *Vista de Log de Tarea* convierte las marcas de tiempo a la zona horaria del usuario, si la configuración correspondiente en las [Preferencias del Perfil](/profile-preferences) está activa. De lo contrario, se utilizará la zona horaria del Agente.

Si el reloj en tiempo real del Agente no está sincronizado, esto puede resultar en marcas de tiempo inexactas en la salida del log.

## Referencias

- [Preferencias del Perfil](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
