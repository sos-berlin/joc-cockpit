**Examples for regular expressions used for replacing**

| *source_file* | *file_spec* | *replacing* | *replacement* | Sample Input | Output | Comment |
| :------- | :--------- | :------- | :---------------------------------- | :----------------- | :---------- | :----- |
| ./temp   | `.*`       | `~`      | `""`                                | `hallo.dat~`       | `hallo.dat`           | - |
| `a.txt`  | -          | `[.]txt` | `_2011-11-24.txt`                   | -                  | `a_2011-11-24.txt`    | - |
| `./temp` | `.*`       | `.*`     | `[filename:] [date:yyyy-MM-dd].dat` | `a.txt`            | `a.txt2011-11-24.dat` | `[filename:]` and `[date:]` will be substituted after replacements to the file name have been applied
| `./temp` | `.*[.]txt` | `a.*?b`  | `world`                             | `a.1.b.txt.b`      | `world.txt.b`         | `.*?` is ungreedy usage of `.*` |
| `abcdefg.txt` | -  | `^(ab)cde(fg)[.]txt` | `123;[date:yyyy-MM-dd]` | -  | `123cde2011-11-24.txt` | use `;` separator for a number of replacements |
| `./temp` | `.*dat$` | `(ab)_c[0-9\]d_(fg)` | `group1;group2` | `ab_c1d_fg. ab_c2d_fg.dat` | `group1_c1d_group2. ab_c2d_fg.dat` | only the first match is replaced |
| `./temp` | `.*` | `^(?:aa|bb)_. {2}_([0-9]+_[0-9]+)$` | `tail` | `aa_QU_061205_222334` | `aa_QU_tail` |` (?:...)` specifies a non-capturing group, the match will not be replaced |
| `./temp` | `FILE.txt` | `.*` | `[filename:lowercase]_[filename:uppercase]_[filename:]` | `FILE.txt` | `file.txt_FILE.TXT_FILE.txt` | -  |


**Example for regular expressions with additional arguments**

| *source_file* | *target_file* | *file_spec* | *create_dir* | *replacing* | *replacement* | Sample Input | Output | Comment |
| :------- | :------- | :------- | :------- | :------- | :------- | :------- | :------- | :------- |
| `aaa/bbb/`| `[directory:]/[date:yyyyMMdd]/` | `hello.txt`| `true` | `[.]txt` | `[date:yyyy].txt` | `aaa/bbb/hello.txt` | `aaa/bbb/20070316/hello2007.txt` | if the directory `aaa/bbb/20070316` does not exist it will be created |

For further information about Java regular expressions see
[java.util.regex.Pattern](https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html).

As an extension to regular expressions the `[date:]` placeholder is supported. When using this feature it is possible to create a regular expression which depends on the date that is specified with the date format string, see [SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html).
