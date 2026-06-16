# Operación Inicial - Registrar Agente Autónomo

La Operación Inicial se realiza tras la instalación del JS7 Controller, Agent y JOC Cockpit. El registro del Agente ocurre después de completar la [Operación Inicial - Registrar Controlador](/initial-operation-register-controller).

## Registrar Agente Autónomo

Los usuarios deben verificar que las conexiones de red desde el servidor del Controlador al servidor del Agente estén disponibles y que las reglas de firewall permitan conexiones al puerto del Agente.

La página *Gestionar Controladores/Agentes* está disponible desde el icono de rueda dentada en la barra de menú principal y ofrece la operación *Agregar Agente Autónomo* desde el menú de acción del Controlador. Esto abre la ventana emergente para el registro de un Agente Autónomo.

Los usuarios proporcionan los siguientes datos:

- **Agent ID** es el identificador único de un Agente que no puede modificarse durante la vida útil del Agente. El *Agent ID* no es visible en Jobs y Workflows.
  - Sugerencia: Use un nombre único como el FQDN del host y el puerto del Agente.
- **Nombre del Agente** es el nombre único de un Agente. Al asignar un Agente a un Job, se utiliza el *Nombre del Agente*.
  - Sugerencia: Si usa entornos separados para producción y no producción, debería usar el mismo *Nombre del Agente* para ambos. Por eso, ingrese un nombre descriptivo, por ejemplo, para un proceso de negocio como *Facturación*, *Contabilidad*, *Reportes*, etc.
  - Sugerencia: Cambiar el *Nombre del Agente* posteriormente permite continuar usando el *Nombre del Agente* anterior como *Nombre Alternativo*.
- **Título** es una descripción que puede agregarse para un Agente.
- **Nombres Alternativos** son nombres alternativos para el mismo Agente. Al asignar un Agente a un Job, también se ofrecerán los *Nombres Alternativos*. Los *Nombres Alternativos* pueden usarse, por ejemplo, si un entorno de pruebas incluye menos Agentes que el entorno de producción: para mantener las asignaciones de Agentes sin cambios entre entornos, los Agentes faltantes se mapean desde los *Nombres Alternativos* del mismo Agente.
- **URL** espera la URL compuesta por protocolo, host y puerto que usa el Controlador para conectarse al Agente, por ejemplo http://localhost:4445.
  - La URL comienza con el protocolo *http* si el Agente usa HTTP simple. Se usa el protocolo *https* si el Agente está configurado para HTTPS.
  - El nombre de host puede ser *localhost* si el Agente está instalado en la misma máquina que el Controlador. De lo contrario, se debe especificar el FQDN del host del Agente.
  - El *puerto* del Agente se determina durante la instalación.

Tras el registro exitoso, el Agente se mostrará en la vista [Recursos - Agentes](/resources-agents).

## Referencias

### Ayuda de Contexto

- [Panel de Control - Estado del Producto](/dashboard-product-status)
- [Operación Inicial - Registrar Clúster de Agentes](/initial-operation-register-agent-cluster)
- [Operación Inicial - Registrar Controlador](/initial-operation-register-controller)

### Base de Conocimiento del Producto

- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
