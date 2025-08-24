# Inventory Search

Inventory Search is used to limit results per object type, for example,

- return objects matching a given name or title, optionally limited by folders,
- return deployed or released objects, draft objects, invalid objects.

## Meta Characters

- The **?** meta character replaces any single character.
- The **\*** meta character replaces zero or more characters.

Search is performed case-insensitive and partially qualified, for example

- searching **rest** will find objects with the name "pdfNon**Rest**artable" and "**REST**-RunningTaskLog"
- searching **re?t** will find objects with the name "ActivePassiveDi**rect**or" and "JITL-JS7**REST**ClientJob"
- searching **re\*t** will find objects with the name "pdSQLExecuto**rExt**ractJSON" and "pdu**Reset**Subagent"

## Advanced Search

The feature is available when clicking the link:<br/>**> Advanced**

### Attribute Search

Advanced Search allows searching by object attributes:

- Searching for **Agent Name** will return results that include jobs executed with the specified Agent.
- Searching for **Count Jobs** will limit search results to Workflows that use the minimum number of jobs specified with the **From** term. If used with the **To** term, then workflows will be returned that include a number of jobs in the range between *From* and *To*. If the *To* term is used only, then Workflows will be returned that do not include a number of jobs exceeding the *To* term.
- Searching for **Job Name** returns Workflows that include jobs matching the given name<br/><br/>
When using the *Exact Match* checkbox for **Job Name**, then the search term entered has to fully match a job name including case-sensitive spelling. Searching for job names ofers bulk operations on jobs for resulting Workflows.

### Dependency Search

The search meta character **\*** is used to specify that dependencies are looked up, for example to a Resource Lock whichever name it might use:

- search with the **\*** meta character for **Resource Locks** will return Workflows using a Resource Lock,
- search with the **\*** meta character for **File Order Sources** will return Workflows referenced by a File Order Source.
