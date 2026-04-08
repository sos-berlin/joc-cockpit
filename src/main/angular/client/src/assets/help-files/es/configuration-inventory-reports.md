# Configuration - Inventory - Reports

The *Report Panel* offers specifying Reports about execution of Workflows and Jobs:

- Report configurations are managed from the inventory available with the JOC Cockpit *Configuration* view. They include specifying:
  - **Report Template** indicating the report type, for example reporting the top 10 failed workflows, the top 100 failed jobs etc. For the full list see [Report Templates](/report-templates).
  - **Report Period** is a date range for which items are reported. Date ranges can be absolute or relative, for example last 2 months, last quarter, last year.
  - **Report Frequency** divides the *Report Period* into equal units of time, for example by week or month.
- Report runs and visualization of Reports are available from JOC Cockpit's *Reports* view.

Reports are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Reports. In addition, the panel offers operations on Reports.
- The *Report Panel* on the right side of the window holds details for Report configuration.

## Report Panel

For a Report the following inputs are available:

- **Name** is the unique identifier of a Report, see [Object Naming Rules](/object-naming-rules).
- **Title** explains the purpose of the Report. 
- **Report Template** specifies the [Report Template](/report-templates) in use.
- **Report Period** specifies the date range which is one of:
  - **from .. to**
    - *Month From*, *Month To* specifies the number of past months from which the *Report Period* will start and by which it will end, for example from *1m*  to *1m* for the last month.
  - **calculated**
    - *Unit* is one of *Year*, *Month*, *Quarter*
    - *From* specifies the number of past units from which the *Report Period* will start, for example *3 Months* ago.
    - *Count* specifies the number of past units by which the *Report Period* will end.
  - **preset** offers selecting from a number of predefined date ranges such as *Last Month*, *This Quarter*, *Last Quarter*, *This Year*, *Last Year*
- **Sort**
  - **Highest**: The Report will return the top n highest values.
  - **Lowest**: The Report will return the top n lowest values.
- **Report Frequency** specifies the *Report Period's* division into equal units of time:
  - *weekly*
  - *every 2 weeks*
  - *monthly*
  - *every 3 months*
  - *every 6 months*
  - *yearly*

## Operations on Reports

For general operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

Operations on Reports are available from the following views:

- Reports are created from the [Report - Creation](/report-creation) view.
- Report runs are available from [Report - Run History](/report-run-history) view.
- Reports are visualized from the [Reports](/reports) view.

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)
- [Reports](/reports)
- [Report - Creation](/report-creation)
- [Report - Run History](/report-run-history)
- [Report Templates](/report-templates)

### Product Knowledge Base

- [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
- [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
- [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
