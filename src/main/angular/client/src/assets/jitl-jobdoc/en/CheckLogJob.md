# Job: CheckLogJob
<summary>
Checks task logs from regular expressions.
</summary>

# Purpose
<detail>

The job is used to check logs of previous job executions for string patterns.

- Users would like to analyze log output of previously executed jobs.
- Analysis includes to identify warnings and errors.
- Analysis includes to identify output for decision-making about next steps in a workflow.
</detail>

# Arguments

## Argument: job
<article id="job">

Specifies the name of the job in the current workflow for which log output should be analysed.

When the job occurs more than once in the workflow, the *label* argument must be specified.
</article>
             
## Argument: label
<article id="label">

Specifies the label of the job for which log output should be analysed.

When the job occurs more than once in the workflow, the *label* argument must be specified to identify the job in question.
</article>

## Argument: pattern
<article id="pattern">

Specifies the regular expression used to search log output for a pattern.

### Example 1: Get Lines with Errors

#### Arguments

* *pattern*: `.*error.*`
* log output: `"One line with error" + "\r\n" + "Line without the word" + "\r\n" + "And one line with error in the middle"`

#### Return Variables: 

- *js7CheckLogMatches*: `One line with error|And one line with error in the middle`
- *js7CheckLogMatchedGroups*:
- *js7CheckLogMatchCount*: `2`
- *js7CheckLogGroupCount*: `0`
- *js7CheckLogGroupsMatchesCount*: `0`

### Example 2: Get Event IDs

#### Arguments

- *pattern*: `event:\d{3}"`
- log output: `"The first line with event:1234" + "\r\n" + "Line without event" + "\r\n"
                + "And one line with event:456 and event:555 in the middle"`

#### Return Variables:

- *js7CheckLogMatches*: `event:123|event:456|event:555`
- *js7CheckLogMatchedGroups*:
- *js7CheckLogMatchCount*: `3`
- *js7CheckLogGroupCount*: `0`
- *js7CheckLogGroupsMatchesCount*: `0`

### Example 3: Get all Dates

#### Arguments

- *pattern*: `\d{1,2}.\d{1,2}.\d{4}`
- log output: `"1.2.2002: erste Zeile" + "\r\n" +  "04.0.1888: Zweite Zeile"  + "\r\n" +  "22.11.2001: Dritte Zeile"`
 
#### Return Variables:

- *js7CheckLogMatchedGroups*:
- *js7CheckLogMatches*: `1.1.2021|22.05.1996|1.04.1888`
- *js7CheckLogMatchedGroups*:
- *js7CheckLogMatchCount*: `3`
- *js7CheckLogGroupCount*: `0`
- *js7CheckLogGroupsMatchesCount*: `0`

### Example 4

#### Arguments

- *pattern*: `(\d{1,2}.\d{1,2}.\d{4}).(.*)$`
- log output: `"1.2.2002: erste Zeile" + "\r\n" +  "04.0.1888: Zweite Zeile"  + "\r\n" +  "22.11.2001: Dritte Zeile"`

#### Return Variables:

- *js7CheckLogMatches*: `1.2.2002: erste Zeile|04.0.1888: Zweite Zeile|22.11.2001: Dritte Zeile`
- *js7CheckLogMatchedGroups*: `1.2.2002|04.0.1888|22.11.2001`
- *js7CheckLogMatchCount*: `3`
- *js7CheckLogGroupCount*: `0`
- *js7CheckLogGroupsMatchesCount*: `6`

</article>

## Argument: separator
<article id="separator">

Specifies the character used to separate matched values.

Applying a regular expression on log output can result in more than one match. The matches are returned with the *js7CheckLogMatches* or *js7CheckLogMatchedGroups* variables and are separated with the *separator* character.                    
</article>

## Argument: timeout
<article id="timeout">

Specifies the maximum duration that the job waits for the task history.

When the CheckLogJob is executed, the history of the job in question might not yet be available. 
The job repeatedly tries to retrieve log ooutput with a delay of 3s each for the maximum duration specified from the *timeout* argument.
</article>

## Argument: multiline
<article id="multiline">

Specifies the handling of log output as one line or as multiple lines.

In multiline mode the `^` and `$` expressions match just after a line terminator or just before a line terminator. 

By default the *pattern* expression matches the begin and end of the entire log output as if it were a single line. 

Multiline mode can be enabled via the embedded flagexpression (?m). 
</article>

## Argument: case_insensitive
<article id="case_insensitive">
              
Specifies case-sensitivity.

By default, case-insensitive matching assumes that only characters in the US-ASCII charset are matched. Unicode-aware case-insensitive matching is enabled by specifying the UNICODE_CASE flag in combination with this flag.
 
Case-insensitive matching can also be enabled via the embedded flag `(?i)` with the *pattern* expression, Specifying this flag may impose slight performance penalties.                    
</article>

## Argument: unix_lines
<article id="unix_lines">

Specifies the handling of line ends.

The flag enables Unix line mode. In Unix line mode, only `\n` is used as a line terminator and `\r` is treated as a literal character.
</article>

# Return Variables

## Return Variable: js7CheckLogMatchedGroups
<article id="js7CheckLogMatchedGroups">

Matching groups separated by the separator character.

A string value holding the matching groups of the task log.
An empty value is returned if the pattern doesn't not match
In case of a pattern specifying capturing groups, the matching characters are provided for each group. 

The return variable holds values per group separated by the character specified from the separator argument.                     
</article>

## Return Variable: js7CheckLogMatches
<article id="js7CheckLogMatches">

Returns matches separated by the *separator* character.

A string value holding the matching characters of the log output.
An empty value is returned if the *pattern* does not match
The return variable holds values per match separated by the character specified from the *separator* argument.                     
</article>

## Return Variable: js7CheckLogMatchCount
<article id="js7CheckLogMatchCount">

Returns the number of matches.
</article>

## Return Variable: js7CheckLogGroupsMatchesCount
<article id="js7CheckLogGroupsMatchesCount">

Returns the number of matching groups.

Depends on value of the *multiline* argument:

- multiline: false -- returns matched groups when the log is processed as one line.
- multiline: true -- returns the sum of matched groups for each line. 
</article>

## Return Variable: js7CheckLogGroupCount
<article id="js7CheckLogGroupCount">

Returns the number of groups.

Returns the number of groups in the *pattern*.
</article>