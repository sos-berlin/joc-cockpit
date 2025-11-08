# File Transfer History

The *File Transfer History* view summarizes the execution history of Orders for YADE Managed File Transfer Jobs.

For log output created from File Transfer Jobs see [Task History](/history-tasks). For the history of Orders see [Order History](/history-orders).

## History Panel

### History of Transfers

Display is grouped in a block for the transfer operation and blocks for transfer of individual files:

- **History Status** indicates if a transfer was *successful* or *failed*.
  - *Success* indicates that all files in the transfer were successfully processed.
  - *Failed* indicates that one or more files in the transfer were processed with errors.
- **Profile Name** is the unique identifier of a file transfer profile.
- **Operation** specifies one of *COPY*, *MOVE*, *REMOVE*, *GETLIST*.
- **Workflow** indicates the Workflow executed by the Order.
  - Clicking the Workflow name navigates to the [Workflows](/workflows) view.
  - Clicking the pencil icon navigates to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view.
- **Order ID** is the unique identifier assigned to an Order.
- **Total** indicates the number of files included in the transfer.

### History per File

A file transfer operation can include any number of files. The *File Transfer History* displays the transfer status per file when clicking the arrow-down icon available from the transfer:

Information displayed is grouped in the following blocks:

- **Source** indicates the source of transfer.
- **Target** indicates the target of transfer.
- **Jump** indicates use of a jump host between source and target. A *Jump* host is used if file transfer cannot be directly performed between source and target but requires a host in the DMZ for incoming and outgoing operations.

Details are displayed for *Source*, *Target* and *Jump* hosts:

- **Host** indicates the hostname or IP address of the server.
- **Account** indicates the user account used to access the server.
- **Port** indicates the port used to connect to the server.
- **Protocol** indicates the file transfer protocol such as FTP, FTPS, SFTP, CIFS etc.

For *Source* and *Target* the following details are displayed:

- **File Name** indicates the name of the file.
- **File Path** shows the directory path of the file, including its name.
- **Status**
  - **TRANSFERRED** indicates that the file was successfully transferred when used with *COPY* or *MOVE* operations.
  - **DELETED** indicates that the file was deleted when used with the *REMOVE* operation.
  - **SKIPPED** indicates that the file was excluded from transfer, for example when used with the *GETLIST* operation.
- **Size** specifies the number of bytes transferred.
- **Integrity Hash** indicates an MD5 hash if the related options was used for transfer.

## References

### Context Help

- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Order History](/history-orders)
- [Task History](/history-tasks)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
