# Profile - Preferences

The *Profile - Preferences* page holds settings for a user account.

When a user connects to JOC Cockpit for the first time, then the *Default User Account's* preferences are copied to the user's preferences. The *Default User Account* is specified from the [Settings - JOC Cockpit](/settings-joc) page.

## Roles

The roles assigned the user account are displayed. Resulting permissions are merged from role assignments and are available from the [Profile - Permissions](/profile-permissions) tab.

## Preferences

Users can modify Preferences at their will.

### Browser related Preferences

Preferences in this section use default values of the browser in use:

- **Language** is the interface language of JOC Cockpit that is available for English, French, German, Japanese.
- **Time Zone** specifies the time zone to which any dates displayed in JOC Cockpit will be converted.
- **Date Time Format** offers selecting from a list of available formats.

### List related Preferences

Preferences apply to display of lists in JOC Cockpit. The following implications should be considered when increasing values:

- Reading more data from JOC Cockpit will not improve responsiveness of the GUI.
- Longer lists will increase the browser's memory & CPU consumption for rendering.

Find the following settings that can be managed for common values from the *Group Limit* link:

- **Max. number of History entries** applies to the [History - Orders](/history-orders) view.
- **Max. number of Audit Log entries** applies to the [Audit Log](/audit-log) view.
- **Max. number of Notification entries** applies to the [Monitor - Order Notifications](/monitor-notifications-order) and [Monitor - System Notifications](/monitor-notifications-system) views.
- **Max. number of Order Overview entries** applies to the [Orders - Overview](/orders-overview) view.
- **Max. number of Daily Plan entries** applies to the [Daily Plan](/daily-plan) view.
- **Max. number of orders per Workflow** limits the number of Orders available with the [Workflows](/workflows) view.
- **Max. number of File Transfer entries** applies to the [History - File Transfers](/history-file-transfers) view.
- **Max. number of orders per Resource Lock** limits the number of Orders displayed with the [Resources - Resource Locks](/resources-resource-locks) view.
- **Max. number of orders per Notice Board** limits the number of Orders displayed with the [Resources - Notice Boards](/resources-notice-boards) view.

### Workflow View Preferences

Preferences apply to the [Workflows](/workflows) view:

- **Max. number of Order History entries per Workflow** limits the number of entries in the *Order History* panel.
- **Max. number of Job History entries per Workflow** limits the number of entries in the *Task History* panel .
- **Max. number of Audit Log entries per object** limits the number of entries in the *Audit Log* panel.

### Configuration - Inventory View Preferences

- **Max. number of Favorite entries** limits display of favorites for example when assigning a Job an Agent.

### Pagination Preferences

Preferences apply to pagination on any page:

- **Max. number of entries per page** limits the number of entries visible on a single page.
- **Default number of entries per page** specifies the default value that can be one of 10, 25, 50, 100, 1000.

### Theme Preferences

- **Change Theme** offers switching between themes. Some themes are provided for higher contrast that can be more suitable for users with visual impairments.
  - **Change Color of order states** is available from an icon right to *Change Theme* and offers changing default colors for [Order States](/order-states). It might look confusing changing colors that are differently represented in the JS7 documentation. However, users with visual impairments might consider this helpful: users can specify RGB values for each color used for an Order state.
- **Menu Bar Color** is available if the *Light* theme is used. This allows changing the background color of the menu bar. The setting can be applied for example, if users work with separate JS7 environments for dev, test, prod: using different background colors helps identifying the related JS7 environment.
- **Theme Title** is displayed just below the menu bar. Similarly to the *Menu Bar Color* this can be used to identify the related JS7 environment.

### Editor Preferences

- **Tab Size** is used in the [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties) tab when editing the *Job Script*. The setting specifies the number of spaces that correspond to the size when hitting the TAB key.

### View Preferences

- **Show Logs** specifies display of the [Order Log View](/order-log) and [Task Log View](/task-log). Both log views offer display and download of logs.
- **Show Documentations** specifies display of user documentation for Workflows and Jobs.

### Configuration View Preferences

- **Show sub-folders and folder contents** rules the behavior when clicking a folder in the *Navigation Panel* of the *Configuration->Inventory* view to either display available objects only or to display available objects and sub-folders.

### Mixed Preferences

- **Show Files immediately in File Transfer view** is useful if each file transfer includes a foreseeable number of files. For single transfers that can include thousands of files it might be preferable to disable the setting.
- **Enable Reasons for Audit Log** will force the user to specify a reason when modifying objects such as adding or cancelling Orders, suspending Workflows etc. The user setting can be overruled from the related [Settings - JOC Cockpit](/settings-joc).
- **Use time zone for log timestamps** is applicable when Agents run on servers in different time zones or different from the Controller server's time zone. In this situation an Order log that holds log output of a number of Jobs executed with possibly different Agents might look confusing. The setting converts log timestamps to the *Time Zone* specified with the user's profile.
- **Current Controller** applies when more than one Controller is connected to JOC Cockpit. The option that is offered in a number of views, for example the [History - Orders](/history-orders) view. When checked it limits display to Orders submitted to the currently selected Controller and otherwise will display Orders of any connected Controller. The setting determines the default value for related *Current Controller* options in JOC Cockpit views.
- **Suppress tooltips for Inventory objects** relates to the *Configuration->Inventory* view that offers tooltips, for example for [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties). Tooltips will pop up if the mouse is moved to the label of an input field to assist users by explaining possible input. While this is useful for users who are not too familiar with JS7, tooltips might not be needed for experienced users.
- **License Warning acknowledged** refers to use of subscription licences that are typically limited to one year. Before license expiration related warnings will be displayed by JOC Cockpit. User can opt to suppress related license expiration warnings. For details see [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Show more options** activates the related slider button in the *Configuration->Inventory* view. It offers more detailed options for job configuration, for example with the [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options) tab.
- **Collapse list variable** applies to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view that offers specifying Workflow Variables from a number of data types. If the *List* data type (array) is used then it can hold a larger number of entries. Users might not want to immediately see list variables expanded when editing a Workflow.

### View Type Preferences

- **Show View** applies to a number of views that offer the related indicator from the upper-right corner of the window. The setting specifies the view type that will be used by default. Users can change the view type on demand in any view. The *Card* view type requires more space on the screen than the *List* view type. However, some users might prefer visibility from cards.
- **Show Orders Overview** is similar to the *Show View* setting but applies to the [Orders - Overview](/orders-overview) view. In addition, the view offers the *Bulk* view type that allows transitioning Orders from bulk operations.

### Workflow Layout Preferences

Preferences apply to display of Workflow Instructions with the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view:

- **Orientation** offers switching display of Workflows to vertical or horizontal presentation. Working with a wide screen using horizontal *Orientation* brings benefits when designing Workflows with a larger number of Jobs and other Workflow Instructions.
- **Spacing between Instructions on adjacent layers** offers modifying the spacing between vertical Workflow Instructions.
- **Spacing between Instructions on the same layer** offers modifying the spacing between horizontal Workflow Instructions.
- **Round Edges for Connections** will flatten edges on display of Workflow Instructions, for example of Jobs.

## References

### Context Help

- [Audit Log](/audit-log)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
  - [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties)
- [Daily Plan](/daily-plan)
- [History - File Transfers](/history-file-transfers)
- [History - Orders](/history-orders)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Orders - Overview](/orders-overview)
- [Profile](/profile)
   - [Profile - Permissions](/profile-permissions)
- [Resources - Notice Boards](/resources-notice-boards)
- [Resources - Resource Locks](/resources-resource-locks)
- [Settings - Daily Plan](/settings-daily-plan)
- [Settings - JOC Cockpit](/settings-joc)
- [Task Log View](/task-log)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - File Transfer History](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Transfer+History)
- [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
