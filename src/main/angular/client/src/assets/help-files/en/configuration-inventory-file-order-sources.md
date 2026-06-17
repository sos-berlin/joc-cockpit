# Configuration - Inventory - File Order Sources

The *File Order Source Panel* offers specifying sources for [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching) with Workflows:

- A directory is monitored by an Agent for incoming files.
- For each incoming file an Order is created that represents the file. 
  - If the file is moved or removed by a Job before completion of the Workflow, then the Order will continue the Workflow and will leave it on completion.
  - If the file remains in place on completion of the Workflow, then the Order will remain available with the *completed* state. To make the Order leave the Workflow, the incoming file has to be moved or removed.
- Orders hold the *file* variable that carries the path to the incoming file. The *file* variable must be declared by the Workflow and can be used by Jobs.

File Order Sources are assigned a Workflow to which they will add an Order per incoming file.

File Order Sources are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding File Order Sources. In addition, the panel offers operations on File Order Sources.
- The *File Order Source Panel* on the right side of the window holds details for File Order Source configuration.

## File Order Source Panel

For a File Order Source the following inputs are available:

- **Name** is the unique identifier of a File Order Source, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the File Order Source's purpose.
- **Tag Name** offers specifying a number of Tags that will be assigned the Orders created for incoming files.
- **Workflow Name** specifies the name of a Workflow to which Orders will be added for incoming files.
- **Agent** specifies the Agent that will monitor the incoming directory.  If an Agent Cluster is used, then File Watching is performed by Director Agents for high-availability: in case of switch-over or fail-over, the Standby Director Agent will be assigned the active role of monitoring directories.
- **Directory** specifies the directory that is watched for incoming files. The Agent's run-time account must be assigned permissions to read and to write (move, remove) incoming files from the *Directory*.
- **Pattern** specifies a Java [Regular Expression](https://en.wikipedia.org/wiki/Regular_expression) to match the names of the incoming files. Regular Expressions are different from use of wildcards. For example, 
  - **.\*** matches any file name,
  - **.\*\\.csv$** matches file names with the extension .csv.
- **Time Zone** specifies the applicable time zone to assign Orders from incoming files to the related Daily Plan date, see [Daily Plan](/daily-plan). For input, time zone identifiers are accepted such as *UTC*, *Europe/London* etc. For a full list of time zone identifiers see [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- **Delay** specifies the number of seconds the Agent will wait until the incoming file is considered stable.
  - On Unix files can be written at the same time as the Agent will read them. This does not apply to Windows environments that by default do not allow reading and writing files at the same point in time.
  - In a first step the Agent will check the file size and modification timestamp. In a second step the Agent will wait for the *Delay* and will repeat the check. If file size and modification timestamp are unchanged, then the Agent will create the Order and otherwise will repeat the second step.
- **Priority**
  - If an Order will meet a *Resource Lock* instruction in the Workflow that limits parallelism, then its *Priority* determines the position in the queue of *waiting* Orders.
  - *Priorities* are specified from negative, zero and positive integers or from the shortcuts offered. A higher *Priority* has precedence. Shortcuts offer the following values:
    - **Low**: -20000
    - **Below Normal**: -10000
    - **Normal**: 0
    - **Above Normal**: 10000
    - **High**: 20000

### Operations on File Order Sources

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)
- [Regular Expression](https://en.wikipedia.org/wiki/Regular_expression)

### Product Knowledge Base

- [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
- [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
