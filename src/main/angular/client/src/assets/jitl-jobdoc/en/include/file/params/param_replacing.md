## Argument: replacing
<article id="replacing">

Specifies a Regular Expression for renaming files.

The argument specifies parts of a file name that should be replaced by the value of the *replacement* argument.

If the expression matches the file name, then Capturing Groups will be replaced.

- Capturing Groups are used for replacement. Only the content of the capturing groups is replaced.<br/>Replacements are separated by a semicolon ";".<br/>Example:<br/>*replacing* = `(1)abc(12)def(.*)`<br/>*replacement* = `A;BB;CCC`<br/>Name of original file: `1abc12def123.txt`<br/> Name after renaming: `AabcBBdefCCC`

- If no Capturing Groups are specified, then the entire match will be replaced.<br/>Example:<br/>*replacing* = `Hello`<br/>*replacement* = `1234`<br/>Input file: `Hello_World.txt`<br/>Output file: `1234_World.txt`

[](include:./note_regexp_example_replace.md)
</article>