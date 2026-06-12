# Monitor - Disponibilidad del Controlador

La vista muestra indicadores de disponibilidad de un Controlador.

Si se usa un Clúster de Controladores, se considera la disponibilidad del clúster. Por ejemplo, si una instancia del Controlador en un clúster se apaga por motivos de mantenimiento y la instancia restante asume la carga, esto no reduce la disponibilidad.

La esquina superior derecha de la pantalla ofrece la casilla *Controlador Actual*: cuando no está marcada, se mostrará la disponibilidad de todos los Controladores conectados; de lo contrario, la información se muestra únicamente para el Controlador seleccionado actualmente.

Los usuarios deben tener en cuenta que los datos históricos de disponibilidad del Controlador están sujetos a depuración por el [Servicio de Limpieza](/service-cleanup).

## Filtros de Fecha

La esquina superior derecha del panel ofrece la selección de un rango de fechas para mostrar la disponibilidad:

- **Semana** hace que el control deslizante de fechas cambie a un período de una semana.
- **Mes** hace que el control deslizante de fechas cambie a un período de un mes.
- **Rango** ofrece especificar la fecha de inicio y la fecha de fin.

## Tiempo de Ejecución

Indica el porcentaje de tiempo durante el cual se confirma que el Controlador estuvo disponible en el período dado.

## Estadísticas

Muestra la disponibilidad mediante un gráfico de barras en base diaria para el período dado.

## Vista General

Muestra la disponibilidad por Controlador y día en el período dado.

- El gráfico indica en color verde las horas en las que se confirma la disponibilidad del Controlador.
- El color rojo indica no disponibilidad.
- El color gris indica datos faltantes.

## Referencias

- [Servicio de Limpieza](/service-cleanup)
- [Monitor - Disponibilidad - Agente](/monitor-availability-agent)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
