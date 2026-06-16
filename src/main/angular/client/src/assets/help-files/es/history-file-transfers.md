# Historial de Transferencia de Archivos

La vista *Historial de Transferencia de Archivos* resume el historial de ejecución de Órdenes para Jobs de Transferencia de Archivos Gestionada YADE.

Para la salida de log creada por los Jobs de Transferencia de Archivos, consulte [Historial de Tareas](/history-tasks). Para el historial de Órdenes, consulte [Historial de Órdenes](/history-orders).

## Panel de Historial

### Historial de Transferencias

La visualización se agrupa en un bloque para la operación de transferencia y bloques para la transferencia de archivos individuales:

- **Estado del Historial** indica si una transferencia fue *exitosa* o *fallida*.
  - *Exitosa* indica que todos los archivos de la transferencia fueron procesados correctamente.
  - *Fallida* indica que uno o más archivos de la transferencia fueron procesados con errores.
- **Nombre del Perfil** es el identificador único de un perfil de transferencia de archivos.
- **Operación** especifica una de *COPY*, *MOVE*, *REMOVE*, *GETLIST*.
- **Workflow** indica el Workflow ejecutado por la Orden.
  - Al hacer clic en el nombre del Workflow se navega a la vista [Workflows](/workflows).
  - Al hacer clic en el icono del lápiz se navega a la vista [Configuración - Inventario - Workflows](/configuration-inventory-workflows).
- **ID de Orden** es el identificador único asignado a una Orden.
- **Total** indica la cantidad de archivos incluidos en la transferencia.

### Historial por Archivo

Una operación de transferencia de archivos puede incluir cualquier número de archivos. El *Historial de Transferencia de Archivos* muestra el estado de transferencia por archivo al hacer clic en el icono de flecha hacia abajo disponible desde la transferencia:

La información mostrada se agrupa en los siguientes bloques:

- **Origen** indica el origen de la transferencia.
- **Destino** indica el destino de la transferencia.
- **Jump** indica el uso de un host intermediario entre el origen y el destino. Se utiliza un host *Jump* cuando la transferencia de archivos no puede realizarse directamente entre el origen y el destino, sino que requiere un host en la DMZ para operaciones de entrada y salida.

Los detalles se muestran para los hosts de *Origen*, *Destino* y *Jump*:

- **Host** indica el nombre de host o la dirección IP del servidor.
- **Cuenta** indica la cuenta de usuario utilizada para acceder al servidor.
- **Puerto** indica el puerto utilizado para conectarse al servidor.
- **Protocolo** indica el protocolo de transferencia de archivos, como FTP, FTPS, SFTP, CIFS, etc.

Para *Origen* y *Destino* se muestran los siguientes detalles:

- **Nombre del Archivo** indica el nombre del archivo.
- **Ruta del Archivo** muestra la ruta del directorio del archivo, incluido su nombre.
- **Estado**
  - **TRANSFERRED** indica que el archivo fue transferido exitosamente cuando se usa con las operaciones *COPY* o *MOVE*.
  - **DELETED** indica que el archivo fue eliminado cuando se usa con la operación *REMOVE*.
  - **SKIPPED** indica que el archivo fue excluido de la transferencia, por ejemplo cuando se usa con la operación *GETLIST*.
- **Tamaño** especifica la cantidad de bytes transferidos.
- **Hash de Integridad** indica un hash MD5 si la opción correspondiente fue utilizada para la transferencia.

## Referencias

### Ayuda Contextual

- [Configuración - Inventario - Workflows](/configuration-inventory-workflows)
- [Historial de Órdenes](/history-orders)
- [Historial de Tareas](/history-tasks)

### Base de Conocimiento del Producto

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
