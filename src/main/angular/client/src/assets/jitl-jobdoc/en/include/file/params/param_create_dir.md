## Argument: create_dir
<article id="create_dir">

**Create directory**

If this argument is set to `true`, then the directory specified as the value of the *target_file* argument is checked for existence. If the target file does not exist, then the value of *target_file* will be created as a directory.

Examples:

| *source_file* | *target_file* | Explanation |
| :--- | :--- | :--- |
| specifies a directory, for example, `/tmp/source` | specifies a non-existing directory, for example, `/tmp/target` | - `create_dir=false`: file operations fail because the *target_file* directory does not exist.<br/>- `create_dir=true`: *target_file* `/tmp/target` directory will be created. |
| specifies a file, for example, `/tmp/source/test.txt` | specifies a non-existing directory, for example, `/tmp/target` | - `create_dir=false`: `/tmp/source/test.txt` is copied/moved to the `/tmp/target` directory.<br/>- `create_dir=true`: the *target_file* `/tmp/target` directory is created and `test.txt` is copied/moved there. |
| specifies a file, for example, `/tmp/source/test.txt` | specifies a file, for example, `/tmp/target/test_copied.txt` | - `create_dir=false`: `/tmp/source/test.txt` is copied/moved to `/tmp/target/test_copied.txt`.<br/>- Note: if the `/tmp/target` directory does not exist, it will be created.<br/>- `create_dir=true`: *target_file* `/tmp/target/test_copied.txt` directory will be created and `test.txt` will be copied/moved there. |
</article>