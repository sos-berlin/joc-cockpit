# Job: PLSQLJob
<summary>
Executes PL/SQL statements in Oracle databases.
</summary>

# Purpose
<detail>

## What is the purpose of this job?

The job executes PL/SQL statements in Oracle databases using JDBC.

## How is the job script defined?

SQL statements can be stored to a file that is specified by the *command_script_file* argument. In addition, they can be specified with the *command* argument.

Before SQL statements are executed, they are checked for placeholders that should be substituted. Placeholders that reference variables are replaced by the variable's value.

The following syntax for use with SQL statements is supported: `${variable}`

## How can results be used in subsequent jobs?

The job offers return variables.

The first set of return variables is static in the sense that variables are always provided, such as the variables explained with section **Return Variables**.

In addition, return variables can be added dynamically. The job parses output of the process and extracts variable names and values using a regular expression.

The regular expression is configured with the *variable_parser_reg_exp* argument.

Return variables are available to jobs and instructions in subsequent nodes of a workflow. The values of return variables can be modified by subsequent jobs and instructions.

## Example: PL/SQL code

```
declare
  howmany NUMBER;
  p_id varchar2(20) := null;
begin
  dbms_output.put_line('set variable1=value1');
  p_id := '12345';
  --
  -- If the job or order contains the argument
  --   table_name=JOC_VARIABLES
  -- then all following select statement is substituted to 'select count(*) into howmany from JOC_VARIABLES;'
  --
  select count(*) into howmany from ${table_name};
  --
  -- now add the results to the buffer
  -- JS7 will read the results from the buffer
  --
  dbms_output.put_line('The table ${table_name} has ' || howmany || ' rows.');
  dbms_output.put_line('set howmany is ' || howmany);
  dbms_output.put_line('set variable1 is ' || p_id);
  dbms_output.put_line('set variable2 is value2');
end;
```
## Example: Specifying return variables

If the job or order carries the *table_name* argument with the `JOC_VARIABLES` value, then later select statements are substituted to `select count(*) into howmany from JOC_VARIABLES;`

The *variable_parser_reg_expr* argument specifies a regular expression to parse output of the process, for example, using the regular expression `^SET\s+([^\s]+)\s*IS\s+(.*)$`.

In the above example the following return variables are created:

- howmany=8
- variable1=12345
- variable2=value2

If the same return variable is set more than once, then the last assignment will be used.
</detail>

# Arguments

[](include:include/common/params/param_hibernate_configuration_file.md)

## Argument: command
<article id="command">

The argument holds SQL statements that are executed by the job.

It is possible to specify more than one SQL statement with the argument. Such SQL statements are carried out in the specified order and must be separated by semicolon and a subsequent new line.

Placeholders in SQL statements are substituted by the job. This is achieved by embedding a workflow variable using the syntax `${variable}` in the SQLstatement. On execution of the job the *variable* is substituted by its current value.

One of the *command* or *command_script_file* arguments must be used.
</article>

## Argument: command_script_file
<article id="command_script_file">

Specifies the path to a file that holds SQL statements that should be executed by the job.

It is possible to specify SQL statements from one or more files. Such SQL statements are executed in the specified order of files.

SQL statements included in files have to be separated by a 	semicolon and a following new line.

Placeholders are substituted in SQL statements by the job. This is achieved by embedding a workflow variable using the sntax `${variable}` in the SQL statement. On execution of the job the *variable* is substituted by its value.

One of the *command* or *command_script_file* arguments must be used.
</article>

## Argument: db_url
<article id="db_url">

Specifies the JDBC URL that looks like this: `jdbc:oracle:thin:@localhost:1521:XE`

The JDBC URL specifies the host and port of the Oracle Listener. Depending on the syntax in use the Service Name or Service ID of the database is specified.

Alternative Sources

- The JDBC URL can be retrieved from a Credential Store by use of the `cs://path/entry@url` syntax.
- The JDBC URL, account and password for can be provide from a file specified with the *hibernate_configuration_file* argument.
</article>

## Argument: db_user
<article id="db_user">

Specifies the user accocunt for access to the database.

- The database user account can be retrieved from a Credential Store by use of the `cs://path/entry@user` syntax.
- The JDBC URL, account and password for can be provide from a file specified with the *hibernate_configuration_file* argument.
</article>

## Argument: db_password
<article id="db_password">

Specifies the password for access to the database.

- The database password can be retrieved from a Credential Store by use of the `cs://path/entry@password` syntax.
- The JDBC URL, account and password for can be provide from a file specified with the *hibernate_configuration_file* argument.
</article>

[](include:include/sql/params/param_variable_parser_reg_expr.md)

## Argument: result_file
<article id="result_file">

Specifies the path to the output file that will hold the result set in csv, xml or json format.

The argument is required by the *resultset_as_variables* argument when used with the `csv`, `xml` or `json` value.
</article>

## Argument: resultset_as_variables
<article id="resultset_as_variables">

Specifies the output format when a result set is stored to a file using the *output_file* argument.

Possible values include `csv`, `xml`, `json` and an empty value.

Assume the the following query:

```
SELECT first_name, last_name, age FROM persons
```

### Argument Value: empty

With an empty value for the *resultset_as* argument, tabular output is written to the job log like this:

| first_name | last_name | age |
| :--- | :--- | :--- |
| John | Doe | 30 |
| Hans | Mustermann | 33 |
| Jean | Dupont | 56 |

### Argument Value: csv

If set to `csv`, the column names and column values of the result set will be written to the file specified with the *output_file* argument enclosed with double quotes and separated by a comma.

```
"FIRST_NAME","LAST_NAME","AGE"
"John","Doe","30"
"Hans","Mustermann","33"
"Jean","Dupont","56"
```

### Argument Value: xml

If set to `xml`, the column names and column values of the result set will be written to the file specified with the *output_file* argument.

```
<RESULTSET>
  <ROW>
    <FIRST_NAME><![CDATA[John]]></FIRST_NAME><LAST_NAME><![CDATA[Doe]]></LAST_NAME><AGE><![CDATA[30]]></AGE>
  </ROW>
  <ROW>
    <FIRST_NAME><![CDATA[Hans]]></FIRST_NAME><LAST_NAME><![CDATA[Mustermann]]></LAST_NAME><AGE><![CDATA[33]]></AGE>
  </ROW>
  <ROW>
    <FIRST_NAME><![CDATA[Jean]]></FIRST_NAME><LAST_NAME><![CDATA[Dupont]]></LAST_NAME><AGE><![CDATA[56]]></AGE>
  </ROW>
</RESULTSET>
```

### Argument Value: json

If set to `json`, the column names and column values of the result set will be written to the file specified with the *output_file* argument.

```
[
  {
    "FIRST_NAME" : "John",
    "LAST_NAME" : "Doe",
    "AGE" : 30
  },
  {
    "FIRST_NAME" : "Hans",
    "LAST_NAME" : "Mustermann",
    "AGE" : 33
  },
  {
    "FIRST_NAME" : "Jean",
    "LAST_NAME" : "Dupont",
    "AGE" : 56
  }
]
```
</article>

[](include:include/common/params/param_credential_store_file.md)
[](include:include/common/params/param_credential_store_key_file.md)
[](include:include/common/params/param_credential_store_entry_path.md)

# Return Variables

## Return Variable: sql_error
<article id="sql_error">

Returns error messages of the JDBC client or the database server.

If errors occur during execution of SQL statements, then error messages will be provided from the *sql_error* return variable in the order of occurrence.

If no errors occur, then the value of the variable is empty.
</article>

[](include:include/sql/params/param_std_out_output.md)
