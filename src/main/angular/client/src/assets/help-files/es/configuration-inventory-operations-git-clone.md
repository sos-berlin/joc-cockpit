# Configuración - Inventario - Operaciones - Git - Clonar Repositorio

Los objetos del Inventario pueden desplegarse utilizando Repositorios Git, ver [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration).

Esto incluye operaciones Git para confirmar (commit), enviar (push) y obtener (pull) objetos.

Los Repositorios Git se mapean a carpetas de inventario de nivel superior.

- La operación inicial consiste en clonar un repositorio remoto a un repositorio local gestionado por JOC Cockpit.
- Los repositorios de JOC Cockpit se encuentran en el directorio del sistema de archivos *\<jetty-base\>/resources/joc/repositories*.
  - El subdirectorio *local* indica un repositorio utilizado para objetos locales a una instancia de JOC Cockpit, por ejemplo, Recursos de Job que contienen configuraciones específicas de un entorno.
  - El subdirectorio *rollout* indica un repositorio utilizado para objetos que se desplegarán en otros entornos, por ejemplo Workflows que deben utilizarse en todos los entornos sin cambios.
  - Para el mapeo de tipos de objetos de inventario a tipos de repositorios Git, ver [Configuración - Git](/settings-git).
- Los usuarios pueden acceder a los repositorios de JOC Cockpit desde el sistema de archivos y pueden usar un cliente Git para operaciones relacionadas, por ejemplo la gestión de ramas.

La operación *Clonar* está disponible en el panel de *Navegación* y se ofrece para carpetas de nivel superior desde su menú de acción de tres puntos. La jerarquía del menú incluye *Repositorio Git->Local|Rollout->Git->Clonar*.

## Clonar Repositorio

<img src="git-clone.png" alt="Git Clone Repository" width="400" height="130" />

El campo de entrada espera la URL Git utilizada para clonar, por ejemplo, *git@github.com:sos-berlin/js7-demo-inventory-rollout.git*

- *git@* es un prefijo constante,
- *github.com* especifica el nombre de host del servidor Git,
- *sos-berlin* es el propietario del repositorio,
- *js7-demo-inventory-rollout* es el nombre del repositorio,
- *.git* es un sufijo constante.

Los valores anteriores representan un ejemplo. Por favor especifique valores que correspondan al servidor Git deseado.

## Referencias

### Ayuda Contextual

- [Matriz de Dependencias](/dependencies-matrix)

### Base de Conocimiento del Producto

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
- [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
