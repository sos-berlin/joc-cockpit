# Configuration - Inventory - Job Templates

The *Job Template* panel offers specifying centrally managed templates for Jobs used in Workflows. They are applied if the same Job implementation is used for a number of Jobs.

- Jobs hold a reference to a Job Template that is applied when the Job is created. 
- Jobs can be updated when Job Templates are changed.
- Job Templates can be created for any Job class such as Shell Jobs and JVM Jobs running in the Agent's Java Virtual Machine.

Job Templates are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Job Templates. In addition, the panel offers operations on Job Templates.
- The *Job Template Panel* on the right side of the window holds details for Job Template configuration.

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

Job Templates offer the following operations to update Jobs:

- **Apply Template to Jobs** button is available when a Job Template is released.
  - A pop-up window is displayed that indicates the Workflows and Jobs that use the Job Template.
  - Users can select Workflows and Jobs that should be updated.
  - **Filter** allows limiting updates to Workflows in *Draft* status and/or in *Deployed* status.
  - **Update Notification** specifies that Job Notification settings should be updated from the Job Template.
  - **Update Admission Times** specifies that Job Admission Times should be updated from the Job Template.
  - **Update from required arguments** specifies that Job Template arguments that are qualified being required should be updated in selected Jobs.
  - **Update from optional arguments** specifies that Job Template arguments that are qualified being optional should be updated in selected Jobs.
- **Update Jobs from Templates** is available from the *Navigation Panel* and will update Jobs in Workflows located in the selected *Inventory Folder* from Job Templates located in any folder.
- **Apply Template to Jobs** is available from the *Navigation Panel* and will update Jobs in Workflows located in any folder that holds references to Job Templates included with the selected *Inventory Folder* or any sub-folder.

After updating Jobs from Job Templates, the related Workflows will be set to *Draft* status and should be deployed to make changes effective.

## Use with Jobs

Job Templates can be created from existing Jobs. In the *Configuration->Inventory* view for a given Workflow users can click the related Job to find its action menu offering the *Make Job Template* operation.

To assign a Job a Job Template users can proceed as follows:

- In the upper-right corner of the window invoke the Wizard.
- This brings up a pop-up window that allows choosing the *User Job Templates* tab.
  - Navigate to the desired Job Template or type parts of its name.
  - Select the Job Template and optionally add arguments if provided by the Job Template.
  
When a Job Template is assigned a Job, this is indicated in the upper-right corner of the window:

- Users find the *Job Template Reference*,
- followed by an icon for the *Synchronization Status Indicator*: 
  - green color indicates that the Job and Job Template are in sync. 
  - orange color indicates that the Job Template was changed and that the Job is not in sync.
- Clicking the orange *Synchronization Status Indicator* will update the Job from its Job Template.

To remove a Job Template reference from a Job, users can click the trash icon in the upper-right corner following the Job Template name. The operation will leave Job properties untouched and will release the link to the Job Template. 

Jobs that reference Job Templates do not allow major parts of the Job being changed. Instead, changes have to be applied to the Job Template. This does not apply to the following inputs that can be freely chosen:

- **Job Name**
- **Label**
- **Agent**
- **Job Admission Times**
- **Job Notification**

To dynamically assign values to **Arguments for JVM Jobs** or **Environment Variables for Shell Jobs** users can proceed as follows:

- The Job Template makes use of a Workflow Variable for the value assigned the *Argument* or *Environment Variable*.
- The Workflow holding the Job that references the Job Template declares the Workflow Variable that can be populated from a default value and from incoming Orders.

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
- [Job Notifications](/configuration-inventory-workflow-job-notifications)
- [Job Options](/configuration-inventory-workflow-job-options)
- [Job Properties](/configuration-inventory-workflow-job-properties)
- [Job Tags](/configuration-inventory-workflow-job-tags)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)
