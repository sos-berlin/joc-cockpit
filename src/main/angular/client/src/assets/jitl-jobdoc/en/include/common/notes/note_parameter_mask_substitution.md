Masks for substitution in file names and directory names are supported from format strings that are enclosed with brackets like `[placeholder]`.
The following placeholders and format strings are supported:

- `[date:date-format]`
  - *date-format* must be a valid Java date format string, for example `yyyyMMddHHmmss` or `yyyy-MM-dd.HHmmss` etc.

For further information on valid values for date format strings see [SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html).
        
**Example**

Argument: *source_file*, value: `sample/hello[date:yyyyMMdd].txt`

For the date 2050-12-31 the *source_file* argument will carry the value `sample/hello20501231.txt`
