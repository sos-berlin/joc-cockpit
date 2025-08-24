# Workflow Search

Workflow Search is used to look up Workflows based on criteria such as

- matching a given name or title, optionally limited by folders,
- Workflow Availability
  - **Synchronized** Workflows that are deployed to a Controller.
  - **Suspended** Workflows that are frozen, i.e. they accept orders but will not allow them to start.
  - **Outstanding** Workflows for which an Agent's confirmation is missing that it has been suspended.
- Job Availability
  - **Skipped** jobs that will not be considered for execution as orders pass by.
  - **Stopped** jobs that will suspend orders arriving.

## Meta Characters

- The **?** meta character replaces any single character.
- The **\*** meta character replaces zero or more characters.

Search is performed case-insensitive and partially qualified, for example

- searching **rest** will find Workflows with the name "pdfNon**Rest**artable" and "**REST**-RunningTaskLog"
- searching **re?t** will find Workflows with the name "ActivePassiveDi**rect**or" and "JITL-JS7**REST**ClientJob"
- searching **re\*t** will find Workflows with the name "pdSQLExecuto**rExt**ractJSON" and "pdu**Reset**Subagent"

## Advanced Search

The feature is available when clicking the link:<br/>**> Advanced**

### Attribute Search

Advanced Search allows searching by object attributes:

- Searching for **Agent Name** will return Workflows that include jobs executed with the specified Agent.
- Searching for **Count Jobs** will return Workflows that use the minimum number of jobs specified with the **From** term. If used with the **To** term, then Workflows will be returned that include a number of jobs in the range between *From* and *To*. If the *To* term is used only, then Workflows will be returned that do not include a number of jobs exceeding the *To* term.
- Searching for **Job Name** returns Workflows that include jobs matching the given name<br/><br/>
When using the *Exact Match* checkbox for **Job Name**, then the search term entered has to fully match a job name including case-sensitive spelling.

### Dependency Search

The search meta character **\*** is used to specify that dependencies are looked up, for example to a Resource Lock whichever name it might use:

- search with the **\*** meta character for **Resource Locks** will return Workflows using a Resource Lock,
- search with the **\*** meta character for **File Order Sources** will return Workflows referenced by a File Order Source.
