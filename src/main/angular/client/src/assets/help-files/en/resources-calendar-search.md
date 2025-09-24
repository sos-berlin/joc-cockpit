# Calendar Search

*Calendar Search* is used to look up Calendars based on criteria such as

- **User Input** matching a given name or title, optionally limited by folders.

## Meta Characters

- **?** meta character will replace any single character.
- **\*** meta character will replace zero or more characters.

Search is performed case-insensitive and partially qualified, for example

- **test** will find Calendars with the name "My-**Test**-Board-1" and "**TEST**-Board-2"
- **te?t** will find Calendars with the name "Global-**Test**-Board-1" and "**TEXT**-Board-2"
- **te\*t** will find Calendars with the name "My-**tExt**-Board-1" and "My-**Terminat**ing-Board-2"

## Advanced Search

The feature is available when clicking the link:<br/>**> Advanced**

### Attribute Search

Advanced Search allows searching by object attributes:

- **Agent Name** will return Calendars for Workflows that include Jobs executed with the specified Agent.
- **Count Jobs** will return Calendars for Workflows that use the minimum number of Jobs specified with the **From** term. If used with the **To** term, then Workflows will be returned that include a number of Jobs in the range between *From* and *To*. If the *To* term is used only, then Workflows will be returned that do not include a number of Jobs exceeding the *To* term.
- **Job Name** will return Calendars for Workflows that include Jobs matching the given name. When using the *Exact Match* checkbox for **Job Name**, then the search term entered has to fully match a job name including case-sensitive spelling.

### Dependency Search

The search meta character **\*** is used to specify that dependencies are looked up, for example to a Resource Lock whichever name it might use:

- **\*** meta character for **Resource Locks** will return Calendars for Workflows using a Resource Lock,
- **\*** meta character for **File Order Sources** will return Calendars for Workflows referenced by a File Order Source.

## References

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Resources - Calendars](/resources-calendars)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
