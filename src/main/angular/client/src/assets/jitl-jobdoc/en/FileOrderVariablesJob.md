# Job: FileOrderVariablesJob
<summary>
Creates dynamic variables from incoming files.
</summary>

# Purpose
<detail>

The job is used to read variables from incoming files.

- this applies to incoming files that are subject to File Watching.
- this applies to any files that are accessible to jobs in a workflow.

The following prerequisites apply to incoming files:

- The incoming file can hold pairs of names and values similar to the temporary file available from the JS7_RETURN_VALUES environment variable for return variables of shell jobs: `name=value`.
  - pairs of names/values are separated from each other by EOL which can be CR, CRLF or LF.
  - The value can include Unicode characters.
- For the handling of incoming files the following applies:
  - If the incoming file holds pairs of names/values for variables, then they are added to the order as return variables.
  - If the incoming file is empty, then no return variables are created and no error is raised.
  - If the incoming file includes content that does not match name/value pairs, then an error is raised.

The job does not use arguments to specify its processing mode. Instead, users can add any arguments to this job that are expected to match the name of a name/value pair in the incoming file:

- Job arguments that are not assigned a value are considered optional for the incoming file. Respective return variables are created only if the incoming file provides the variable. This includes that the incoming file specifies an empty value for the variable.

- Job arguments that are assigned a value are considered optional. 
  - If the incoming file does not provide the variable, then a return variable with the job's default value is created.
  - If the incoming file provides a variable optionally with an empty value, then a return variable with the value from the incoming file's variable is created.  
- For pairs of names/values for which no arguments are specified the job will raise an error.

Example of an incoming file:

- `var1=value1`
- `var2=value2`
- `var3=`
- The variables *var1* and *var2* will be created with their respective values. For *var3* an empty variable will be returned from the job.

</detail>

# Arguments

## Argument: js7_source_file
<article id="js7_source_file">

Specifies the path to the input file.

- If the workflow is not assigned a File Order Source, then the input file path can be specified.
- If the workflow in use is subject to File Watching, then this argument is not required as the internal *file* variable will be used.
- If the workflow is not subject to File Watching, then the path to the incoming files has to be specified with the the argument.                	
</article>

# Return Variables

The provides return variables from name/value pairs found in the incoming file.
