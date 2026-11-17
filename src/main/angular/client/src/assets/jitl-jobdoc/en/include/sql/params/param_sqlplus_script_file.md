## Argument: command_script_file
<article id="command_script_file">

Specifies the path to a file holding the SQL statements that should be executed.

- SQL statements are specified from an input file for the SQL\*Plus Client.
- SQL statements included in a file must be separated by a semicolon and a following new line.

Placeholders in SQL statements are automatically substituted. This is achieved by embedding a variable using the `${variable}` syntax in the SQL statement. On execution of the job the *variable* is assigned its effective value.

```<![CDATA[
WHENEVER SQLERROR EXIT SQL.SQLCODE
WHENEVER OSERROR EXIT FAILURE

column end_date new_value BCY_DATE
column period new_value PN_YEAR_PERIOD
column period_prev new_value PN_YEAR_PERIOD_PREV

select '${my_end_date}' as end_date from dual;
prompt SET end_date IS &BCY_DATE;
/
select '${my_period}' as period from dual;
prompt SET period IS &PN_YEAR_PERIOD;
/
select '${my_period_prev}' as period_prev from dual;
prompt SET period_prev IS &amp;PN_YEAR_PERIOD_PREV;
/
prompt SET end_date IS &BCY_DATE;
exit;
```

In the above example the `${my_end_date}`, `${my_period}` and `${my_period_prev}` workflow variables are embedded in SQL statements.
</article>