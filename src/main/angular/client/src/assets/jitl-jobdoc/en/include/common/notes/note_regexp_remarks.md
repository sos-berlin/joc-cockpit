A few remarks on regular expressions used in JobScheduler and YADE.

A regular expression is not a [wildcard](https://en.wikipedia.org/wiki/Wildcard_character#File_and_directory_patterns).
To get an idea of the differences, users can check the meaning of the wildcard \*.txt, which will
select all file names with the file name extension `.txt`.
A regular expression works in a similar way, the wildcard just looks like `^.*\.txt$`.
This is more flexible and powerfull for filtering file names
than the concept of wildcards, if users want to filter more complex names or patterns.

The general syntax of a
[regular expression](https://en.wikipedia.org/wiki/Regular_expression) is explained by The IEEE and The Open Group like
[this](https://pubs.opengroup.org/onlinepubs/009695399/basedefs/xbd_chap09.html).

There are differences in regular expression implementation, for example in Java and Perl.

For further information about Java regular expressions see
[java.util.regex.Pattern](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

If users want only parts of a regular expresion to be case sensitive, then they have the option to use
the `(?-i)` and optionally `(?i)` modifiers, for example, `(?-i)G[a-b](?i).*`

Users dealing with Unicode characters should check if their regular expression engine properly supports Unicode.
