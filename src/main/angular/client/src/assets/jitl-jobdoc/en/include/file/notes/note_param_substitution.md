**Argument substitution**
    
The JobScheduler supports substitution of argument values if the value references a variable such as `$variabble`

Example for substitution:

- *source_file*: `$file`

Explantion: 

- In this example the value of the *file* variable is used as the value for the *source_file* variable.
- When a workflow is triggered by File Watching then it includes the *file* variable that holds the path to the incoming file.
