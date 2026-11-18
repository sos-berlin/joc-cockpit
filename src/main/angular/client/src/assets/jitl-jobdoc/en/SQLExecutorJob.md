# Job: SQLExecutorJob
<summary>
Executes SQL statements in a database via JDBC.
</summary>

# Purpose
<detail>

## Which DBMS versions can be used?

The JS7 is actively tested with the following DBMS:

| Databases | Supported Compatibility | Reported Compatibility | JDBC Driver |
| :--- | :--- | --- | :--- |
| MariaDB     | [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) | All actively supported versions | JDBC Driver ships with JS7 |
| MySQL       | [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) | All actively supported versions |  MariaDB JDBC Driver can be used |
| Oracle      | [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) | All actively supported versions | JDBC Driver ships with JS7 |
| PostgreSQL  | [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) | All actively supported versions | JDBC Driver ships with JS7 |
| SQL Server | [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) | All actively supported versions | JDBC Driver must be downloaded by user |

For DBMS not in the above list users must download the JDBC Driver and must check if the DBMS version in use is compatible.

## How is the job script defined?

SQL statements are specified with the *command* argument.

Before SQL statements are executed, they are checked for placeholders that should be substituted. Placeholders that reference variables are replaced by the variable's value.

The following syntax for use with SQL statements is supported: `${variable}`

## How can results be used in subsequent jobs?

Return variables can be added dynamically from the result set provided by the database.

Return variables are available to jobs and instructions in subsequent nodes of a workflow. The values of return variables can be modified by subsequent jobs and instructions.
</detail>

# Arguments

[](include:include/common/params/param_hibernate_configuration_file.md)

## Argument: command
<article id="command">

The argument holds SQL statements that are executed by the job.

It is possible to specify more than one SQL statement with the argument. Such SQL statements are carried out in the specified order and must be separated by semicolon and a subsequent new line.

Placeholders in SQL statements are substituted by the job. This is achieved by embedding a workflow variable using the syntax `${variable}` in the SQLstatement. On execution of the job the *variable* is substituted by its current value.
</article>

## Argument: resultset_as_warning
<article id="resultset_as_warning">

If set to `true`, a warning will be issued if the SQL statement(s) create a result set.
</article>           

## Argument: exec_returns_resultset
<article id="exec_returns_resultset">
 
If stored procedures are called that return a result set, then the argument must be set to `true` in order to run stored procedure as queries.
</article>

## Argument: result_file
<article id="result_file">

Specifies the path to the output file that will hold the result set in csv, xml or json format.

The argument is required by the *resultset_as* argument when used with the `csv`, `xml` or `json` value 
</article>            

## Argument: resultset_as
<article id="resultset_as">

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
                      
### Argument Value: column_value

The first row of the result set will be used to create return variables using column names as variable names.

From the above query the following name/value pairs will be created as return variables:

- *first_name* = `John`
- *last_name* = `Doe`
- *age* = `30`

### Argument Value: name_value

The first two columns of the result set will be turned into result variables. The values of the first column will become variable names, the values of the second column will become variable values. 

From the above query the following name/value pairs will be created as result variables:

- *John* = `Doe`
- *Hans* = `Mustermann`
- *Jean* = `Dupont`
                      
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

The job creates dynamic return variables when used with the *resultset_as* argument holding one of the values `column_value` or `name_value`.
