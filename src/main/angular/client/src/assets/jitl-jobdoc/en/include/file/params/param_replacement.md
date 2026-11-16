## Argument: replacement
<article id="replacement">

Specifies the replacement applied when renaming files.

The *replacement* argument specifies characters that will be used when replacing parts of a filename. The *replacing* argument specifies which characters will be replaced in a file name. Use of the *replacement* argument requires the *replacing* argument being specified.

Should a number of Capturing Groups be replaced, then one replacement string per group has to be specified. Replacement strings are separated by a semicolon like this:

*replacement*: `aa;[filename:];bb`

Placeholders are substituted in a file name with format strings that are enclosed by `[...]`. The following placeholders and format strings are supported:

- `[date:date-format]`: date-format must be a valid Java date format string, for example, `yyyyMMddHHmmss`, `yyyy-MM-dd.HHmmss` etc.
- `[filename:]`: will be substituted by the original file name including the file extension.
- `[filename:lowercase]`: will be substituted by the original file name including the file extension with all characters converted to lower case.
- `[filename:uppercase]`: will be substituted by the original file name including the file extension with all characters converted to upper case.

Example:
- *replacing* = `Hello`
- *replacement* = `1234`
- Input file: `Hello_World.txt`
- Output file: `1234_World.txt`
</article>