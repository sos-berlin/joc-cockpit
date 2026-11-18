## Argument: variable_parser_reg_expr
<article id="variable_parser_reg_expr">

Specifies a Regular Expression for parsing of process output. Any matches are available as dynamic workflow variables.

- The regular expression must include two capturing groups.
- The first capturing group states the variable name and the second group states the value.

The *prompt* instruction in SQL\*Plus is used to write output like this:

```
            WHENEVER SQLERROR EXIT SQL.SQLCODE
            WHENEVER OSERROR EXIT FAILURE
            prompt ready;
            prompt foo = bar;
            prompt SET hello IS world;
            exit;
```

The *dbms_output.put_line()* function in PL/SQL is used to write output like this:

```
            begin
                dbms_output.put_line('ready');
                dbms_output.put_line('SET hello IS world');
                dbms_output.put_line('foo = bar');
            end;
```

The argument holds the default value `"^SET\s+([^\s]+)\s*IS\s+(.*)$"`. The expression matches the output `SET hello IS world` and creates the *hello* workflow variable with the `world` value.

Example for alternative expression:

- `^([^=]+)\s*=\s+(.*)$` returns the workflow variable *foo* with the value `bar`.

[](include:include/common/notes/note_regexp_remarks.md)
[](include:include/common/notes/note_regexp_additional.md)
</article>