**How to handle stderr channel and exit code**

The job provides arguments to handle the stderr channel and the exit code:

- *ignore_stderr*
- *ignore_error*
- *exit_codes_to_ignore*
- *raise_exception_on_error*

As an example, consider the command `ls _unknown_folder_; exit 5;`

The commmand raises an error and causes output to stderr to look like this: `ls: _unknown_folder_: No such file or directory` and returns exit code 5.

| *ignore_stdout* | *ignore_error* | *raise_exception_on_error* | Exit code of command | Exit Code of job |
| :---    | :---    | :---    | :--- | :--- |
| `false` | `false` | `true`  | `5`  | `1`  |
| `true`  | `false` | `true`  | `5`  | `1`  |
| `false` | `true`  | `true`  | `5`  | `1`  |
| `true`  | `true`  | `true`  | `5`  | `0`  |
| `false` | `false` | `false` | `5`  | `5`  |
| `true`  | `false` | `false` | `5`  | `5`  |
| `false` | `true`  | `false` | `5`  | `5`  |
| `true`  | `true`  | `false` | `5`  | `1`  |

The job provides the following return variables:

- *std_out_output*
- *std_err_output*
- *exit_code*

Return variables can be used in next jobs of the workflow.
