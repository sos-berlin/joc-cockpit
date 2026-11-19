# Job: SQLPLUSJob
<summary>
Starts SQL\*Plus client and executes statements in Oracle databases.
</summary>

# Purpose
<detail>

## What is the purpose of this job?

The job starts the SQL\*Plus client in a separate process. It executes SQL statements from the *command* argument or from a file indicated by the *command_script_file* argument. 

The job keeps control of the program flow and will terminate SQL\*Plus in case of success or errors.

## How are SQL statements processed?

SQL statements can be stored to a file that is specified by the *command_script_file* argument. Alternatively, they can be specified from the *command* argument.

Before the SQL\*Plus Client is launched for execution of SQL statement, the following steps are applied:

- First, for each parameter a `DEFINE` directive is generated. The directives are written to a temporary file.
- Provided the *include_files* argument is specified, related files are appended to the temporary file.
- Then the original SQL statments from the *command* or *command_script_file* arguments are added to the temporary file.
- Subsequently, all placeholders specified directly with SQL statements are substituted by variable values.
- Finally the temporary file is used for execution with the SQL\*Plus client.

The following syntax for use of variables with SQL statements is supported: `${variable}`

## How to use parameters in SQL scripts?

Workflow variables can be used in SQL statements in two ways:

- First, all arguments can be used in SQL\*Plus statements from their name preceeded by an ampersand `&`.
  - The arguments are defined as SQL*Plus variables by the job.
  - The job creates a "DEFINE" directive for each argument.
- Second, the names of arguments can be used directly in SQL statements. Names are replaced by value of the respective argument.

## How to access stdout and stderr channels?

The contents of stdout and stderr channels are available from related return variables such as *sql_error*.

Subsequent jobs and instructions in a workflow can access the return variables.

## How can results be used in subsequent jobs?

The job offers return variables.

The first set of return variables is static in the sense that variables are always provided, such as the variables explained with section **Return Variables**.

In addition, return variables can be added dynamically. The job parses output of the process and extracts variable names and values using a regular expression.

The regular expression is configured with the *variable_parser_reg_exp* argument.

Return variables are available to jobs and instructions in subsequent nodes of a workflow. The values of return variables can be modified by subsequent jobs and instructions.

## How are errors managed?

The job detects errors reported by the SQL\*Plus Client. Such errors use an identifier starting with the string `SP2-` followed by a number. 

In addition, the job detects errors reported by the database server on execution of SQL statements. Such errors use an identifier starting with the string `ORA-` followed by a number.

If SP2-\* or ORA-\* errors occur, then the job will terminated abnormally and a return code 98 is set.

In addition, the error message is reported as the value of the *sql_error* return variable.

## Can errors be ignored?

It is possible to ignore errors using the *ignore_sp2_messages* and *ignore_ora_messages* arguments. The identifiers of errors that should be ignored are specified as values of the arguments.

Error messages are available with the stdout channel, even if they are ignored.

## Example: SQL\*Plus code

```
WHENEVER SQLERROR EXIT SQL.SQLCODE
WHENEVER OSERROR EXIT FAILURE

column end_date new_value BCY_DATE
column period new_value PN_YEAR_PERIOD
column period_prev new_value PN_YEAR_PERIOD_PREV

select '0' as end_date from dual;
prompt SET end_date IS &BCY_DATE;
/
select '0' as period from dual;
prompt SET period IS &PN_YEAR_PERIOD;
/
select '0' as period_prev from dual;
prompt SET period_prev IS &PN_YEAR_PERIOD_PREV;
/
prompt SET end_date IS 1;
exit;
```

By default the `^SET\s+([^\s]+)\s*IS\s+(.*)$` regular expression will be used to parse the output of SQL statements and to create resulting return variables, for details see *variable_parser_reg_expr* agument.
</detail>

# Arguments

## Argument: shell_command
<article id="shell_command">

The argument specifies the path to the SQL\*Plus client, by default `slqplus`.
</article>

## Argument: command_line_options
<article id="command_line_options">

Specifies command line options available for the SQL\*Plus Client such as `-S -L`.
</article>

[](include:include/sql/params/param_sqlplus_db_url.md)

## Argument: db_user
<article id="db_user">

Specifies the user accocunt for access to the database.

The database user account can be retrieved from a Credential Store by use of the `cs://path/entry@user` syntax.
</article>

## Argument: db_password
<article id="db_password">

Specifies the password for access to the database.

The database password can be retrieved from a Credential Store by use of the `cs://path/entry@password` syntax.
</article>

[](include:include/sql/params/param_sqlplus_script_file.md)

## Argument: include_files
<article id="include_files">

Specifies files that hold SQL statements that should be included.

The argument is specified to include additional SQL statements from files.

If more than one file is specified, file paths must be separated by semicolon.
</article>

## Argument: command
<article id="command">

The argument holds SQL statements that are executed by the job.

The argument specifies SQL statements that are prepended the SQL script file specified by the *command_script_file* argument and after optional files specified by the *include_files* argument are embedded.

It is possible to specify more than one SQL statement with the argument. Such SQL statements are carried out in the specified order and must be separated by semicolon and a subsequent new line.

Placeholders in SQL statements are substituted by the job. This is achieved by embedding a workflow variable using the syntax `${variable}` in the SQLstatement. On execution of the job the *variable* is substituted by its current value.
</article>

## Argument: command_script_file
<article id="command_script_file">

Specifies the path to a file that holds SQL statements that should be executed by the job.

It is possible to specify SQL statements from one or more files. Such SQL statements are executed in the specified order of files.

SQL statements included in files have to be separated by a 	semicolon and a following new line.

Placeholders are substituted in SQL statements by the job. This is achieved by embedding a workflow variable using the sntax `${variable}` in the SQL statement. On execution of the job the *variable* is substituted by its value.

One of the *command* or *command_script_file* arguments must be used.
</article>

## Argument: timeout
<article id="timeout">

Specifies the timeout in seconds for the SQL statements to be executed by the SQL\*Plus Client. The default is: unlimitted.
</article>

[](include:include/sql/params/param_variable_parser_reg_expr.md)

## Argument: ignore_ora_messages
<article id="ignore_ora_messages">

Specifies that certain "ORA-" error messages should be ignored.

The value of the argument is a list of identifiers for Oracle server error messages that should be ignored.

If more than one identifier is used, they must be separated by semicolon. The `ORA-` prefix can be omitted.
</article>

## Argument: ignore_sp2_messages
<article id="ignore_sp2_messages">

Specifies that certain "SP2-" error messages should be ignored.

The value of the argument is a list of identifiers for Oracle SQL\*Plus error messages that should be ignored.

If more than one identifier used, they must be separated by semicolon. The `SP2-` prefix can be omitted.
</article>

[](include:include/common/params/param_credential_store_file.md)
[](include:include/common/params/param_credential_store_key_file.md)
[](include:include/common/params/param_credential_store_entry_path.md)

# Return Variables

## Return Variable: sql_error
<article id="sql_error">

Returns error messages of the SQL\*Pluas client or the database server.

If errors occur during execution of SQL statements, then error messages will be provided from the *sql_error* return variable in the order of occurrence.

If no errors occur, then the value of the variable is empty.
</article>

[](include:include/sql/params/param_std_out_output.md)
[](include:include/sql/params/param_exit_code.md)
