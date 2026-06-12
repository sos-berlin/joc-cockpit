# Ejecuciones de Jobs del Agente

La vista *Ejecuciones de Jobs del Agente* resume las ejecuciones de Jobs por Agentes en un período determinado.

Los Agentes se presentan en las siguientes modalidades:

- **Agentes Autónomos** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Se operan de forma individual y son gestionados por el Controlador.
- **Clúster de Agentes**
  - **Agentes Directores** orquestan *Subagentes* en un Clúster de Agentes. Además, pueden utilizarse para ejecutar Jobs.
  - **Subagentes** ejecutan Jobs en máquinas remotas on-premises y desde contenedores. Pueden considerarse nodos de trabajo en un Clúster de Agentes y son gestionados por *Agentes Directores*.

## Panel de Ejecuciones de Jobs del Agente

Se muestra la siguiente información:

- **Nombre del Agente** es el nombre único de un Agente.
- **URL** es la URL mediante la cual el Agente puede ser alcanzado desde el Controlador.
- **Número de tareas ejecutadas exitosamente** es lo que el título sugiere.
- **Número de tareas ejecutadas** incluye ejecuciones de Jobs exitosas y fallidas.

## Exportar Ejecuciones de Jobs del Agente

Los usuarios pueden exportar el resumen de información mostrada a un archivo Excel en formato .xlsx. Los filtros activos y el orden de clasificación se aplicarán a la exportación.

## Filtros

Los usuarios pueden aplicar los filtros disponibles en la parte superior de la ventana para limitar el resumen de ejecuciones de Jobs:

- Los botones de filtro **Rango de Fechas** permiten elegir el rango de fechas para el resumen de ejecuciones de Jobs.
- La casilla de verificación **Controlador Actual** limita las ejecuciones de Jobs a los Agentes registrados con el Controlador actualmente seleccionado.

## Filtro Avanzado

El *Filtro Avanzado* ofrece criterios de filtro para un rango de fechas más amplio, para instancias específicas de Agentes e instancias de Controladores.

El *Filtro Avanzado* permite exportar datos sujetos a los criterios especificados.

## Referencias

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
