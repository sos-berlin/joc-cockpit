# Configuration - Inventory - Job Templates

The *Job Template Panel* offers specifying central templates for Jobs used in any Workflow. They are applied if the same Job implementation is used for a number of Jobs.

- Jobs hold a reference to a Job Template that is applied when the Job is created. 
- Jobs can be updated when Job Templates are changed.
- Job Templates can be created for any Job class such as Shell Jobs and JVM Jobs running in the Agent's Java Virtual Machine.

Job Templates are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Schedules. In addition, the panel offers operations on Schedules.
- The *Job Template Panel* on the right side of the window holds details for Schedule configuration.

## Job Template Panel

For a Job Template the following inputs are available:

- **Name** is the unique identifier of a Job Template, see [Object Naming Rules](/object-naming-rules).
- Other inputs correspond to inputs of a Job:
  - [Job Properties](/configuration-inventory-workflow-job-properties)
  - [Job Options](/configuration-inventory-workflow-job-options)
  - [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
  - [Job Notifications](/configuration-inventory-workflow-job-notifications)
  - [Job Tags](/configuration-inventory-workflow-job-tags)
- **Arguments** are used for JVM Jobs. 
  - **Required** specifies if the argument is required or can be removed when used in a Job.
  - **Description** adds an explanation to the argument that can include HTML tags.

## Operations on Job Templates

For general operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

Job Templates offer the operation *Apply Template to Jobs*.

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Workflow - Run-time](/configuration-inventory-schedules-run-time)
- [Job Properties](/configuration-inventory-workflow-job-properties)
- [Job Options](/configuration-inventory-workflow-job-options)
- [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
- [Job Notifications](/configuration-inventory-workflow-job-notifications)
- [Job Tags](/configuration-inventory-workflow-job-tags)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)
