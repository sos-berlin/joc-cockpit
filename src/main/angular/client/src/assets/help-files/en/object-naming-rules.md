# Object Naming Rules

Object Names are specified in a number of places for:

- Workflows, Jobs, Variables, Notice Boards, Resource Locks, File Order Sources, Job Resources, Folders,
- Calendars, Schedules, Script Includes, Job Templates, Reports.

JS7 does not enforce naming conventions for objects: users are free to choose naming conventions at their will, for example for Job names using:

- camel case style as in: *loadDataWarehouseDaily*
- kebab style as in: *load-data-warehouse-daily*
- mixed style as in: *DataWarehouse-Load-Daily*

## Character Set

JS7 allows use of Unicode characters for Object Names.

### Object Names

A number of restrictions apply to Object Names:

#### Naming Rules

- The following naming rules must be considered for Object Names: [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- No control characters are allowed according to the regular expression \[^\\\\x00-\\\\x1F\\\\x7F\\\\x80-\\\\x9F\]
- No punctuation characters are allowed. However, dots '.', underscore '_' and dash '-' are allowed according to the regular expression: \[^\\\\x20-\\\\x2C\\\\x2F\\\\x3A-\\\\x40\\\\x5B-\\\\x5E\\\\x60\\\\x7B-\\\\x7E\\\\xA0-\\\\xBF\\\\xD7\\\\xF7\]
  - Dot: is not allowed as a leading or trailing character and two dots in sequence are not allowed.
  - Dash: is not allowed as a leading or trailing character and two dashes in sequence are not allowed.
  - Brackets are not allowed \[({})\]
- Half-width characters are not allowed, see [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)).
- Spaces are not allowed.
- Object Names may start with a digit.
- Use of Java reserved keywords is not allowed:
  - *abstract, continue, for, new, switch, assert, default, goto, package, synchronized, boolean, do, if, private, this, break, double, implements, protected, throw, byte, else, import, public, throws, case, enum, instanceof, return, transient, catch,  extends, int, short, try, char, final, interface, static, void, class, finally, long, strictfp, volatile, const, float, native, super, while*
  - Example: use of the reserved keyword *switch* is not allowed, use of *myswitch* is allowed.

#### Examples

- National language characters such as Japanese:
  - *こんにちは世界*
- Use of dot, dash, underscore:
  - *Say.Hello*
  - *Say-Hello*
  - *say_hello*

### Labels

More relaxed rules apply to *Labels* that are used to indicate the position of a Job or other Workflow Instruction:

- Labels can start with digits, characters, _
- Labels can include $, _, -, #, :, !
- Labels cannot include whatever is not allowed for Object Names, for example no quotes, no spaces, \[, \], {, }, /, \, =, +

### Uniqueness of Object Names

Object Names in JS7 are unique per object type, i.e per Workflow, per Job in a Workflow, per Resource Lock etc.

- Users can add Object Names with uppercase/lowercase spelling.
- The object name is preserved by the JOC Cockpit GUI exactly as typed by the user.
- Users cannot add the same Object Name with a different spelling if this is not supported by the underlying DBMS for the *nvarchar* data type. For example, assume an existing Object Name *myLock*, then a new object with the name *mylock* cannot be created when using the MySQL DBMS.

### Length of Object Names

The maximum length of Object Names is as follows:

- Basically Object Names can consume up to 255 Unicode characters.
- The following restriction applies:
  - Objects typically are located in folders: the overall length of the folder hierarchy and object name may not exceed 255 characters.
  - Branches within a [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) are limited to 10 characters.
  - Branches can be nested for up to 15 levels.

## References

- [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))
- [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
- [JS7 - Object Naming Rules](https://kb.sos-berlin.com/display/JS7/JS7+-+Object+Naming+Rules)
