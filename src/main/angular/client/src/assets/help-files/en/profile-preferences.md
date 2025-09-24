# Profile - Preferences

The *Profile - Preferences* page holds settings for user accounts.

When a user account connects to JOC Cockpit for the first time, then the *Default User Account's* preferences are copied to the user's preferences. The *Default User Account* is specified from the [Settings - JOC Cockpit](/settings-joc) page.

## User Details

The user's *Account Name* is displayed.

If the user account is logged in from an Identity Service that makes use of passwords managed with JOC Cockpit, then the *Change Password* operation is available. Users can change their password any time.

## Roles

The roles assigned the user are displayed. Resulting permissions are merged from role assignments and are available from the [Profile - Permissions](/profile-permissions) tab.

## Preferences

Users can modify Preferences at their will.

- **Language** is the interface language of JOC Cockpit that is available from English, French, German, Japanese.
  - Default: browser language settings
- **Time Zone** specifies the time zone to which any dates displayed in JOC Cockpit will be converted.
  - Default: browser time zone settings
- **Date Time Format** offers selecting from a list of available formats.
  - Default: browser date time settings

### Maximum Number of Entries

The following preferences apply to display of lists in JOC Cockpit. The following implications should be considered when increasing values:

- Reading more data from JOC Cockpit will not improve responsiveness of the GUI.
- Longer lists will increase the browser's memory & CPU consumption for rendering.

- **Max. number of History entries** applies to the [History - Orders](/history-orders) view.
- **Max. number of Audit Log entries** applies to the [Audit Log](/audit-log) view.
- **Max. number of Notification entries** applies to the *Monitor-Order Notifications* view.
- **Max. number of Order Overview entries** applies to the [Orders - Overview](/orders-overview) view.
- **Max. number of Daily Plan entries** applies to the [Daily Plan](/daily-plan) view.
- **Max. number of orders per Workflow** limits the number of Orders displayed with the [Workflows](/workflows) view.
- **Max. number of File Transfer entries** applies to the [History - File Transfers](/history-file-transfers) view.
- **Max. number of orders per Resource Lock** limits the number of Orders displayed with the [Resources - Resource Locks](/resources-resource-locks) view.
- **Max. number of orders per Notice Board ** limits the number of Orders displayed with the [Resources - Notice Boards](/resources-notice-boards) view.

### Workflow View Preferences

Preferences apply to the [Workflows](/workflows) view:

- **Max. number of Order History entries per Workflow** limits the number of entries in the *Order History* panel.
- **Max. number of Job History entries per Workflow** limits the number of entries in the *Task History* panel .
- **Max. number of Audit Log entries per object** limits the number of entries in the *Audit Log* panel.

- **Max. number of Favorite entries** limits display of favorites for example when assigning a Job an Agent.

The following preferences apply to pagination on any page:

- **Max. number of entries per page** limits the number of entries visible on a single page.
- **Default number of entries per page** specifies the default value that can be one of 10, 25, 50, 100, 1000.

### Theme Preferences

- **Change Theme** offers to switch between a number of themes. Some themes are provided for higher contrast that can be more suitable for users with visual impairment.
  - **Change Color of order states** is available an icon right to *Change Theme* and offers changing default colors of [Order States](/order-states). It might look confusing changing colors that are differently represented in the JS7 documentation. However, users with visual impairment might consider this helpful: users can specify RGB values for each color used for an Order state.
- **Menu Bar Color** is available if the *Light* theme is used. This allows to change the background color of the menu bar. The setting can be applied for example, if users work with separate JS7 environments for dev, test, prod: using different background colors helps identifying the related JS7 environment.
- **Theme Title** is displayed just below the menu bar. Similarly to the *Menu Bar Color* this can be used to identify the related JS7 environment.

### Editor Preferences

- **Tab Size** is used in the [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties) tab when editing the *Job Script*. The setting specifies the number of spaces that correspond to the size when hitting the TAB key.

### View Preferences

- **Show Logs** specifies display of the [Order Log View](/order-log) and [Task Log View](/task-log). Both views offer display and download of logs.
- **Show Documentations** specifies display of the user documentation for Workflows and Jobs.

### Configuration View Preferences

- **Show sub-folders and folder contents** rules the behavior when clicking a folder in the *Navigation Panel* of the *Configuration-Inventory* view to either display available objects only or to display available objects and sub-folders.

### Mixed Preferences

- **Show Files immediately in File Transfer view** is useful if each file transfer includes a foreseeable number of files. For single transfers that can include thousands of files it might be preferable to disable the setting.
- **Enable Reasons for Audit Log** will force the user to specify a reason when modifying objects such as adding or cancelling Orders, suspending Workflows etc. The user setting can be overruled from the related [Settings - JOC Cockpit](/settings-joc).
- **Use time zone for log timestamps** is applicable when Agents run on servers in different time zones. In this situation an Order log that holds log output of a number of Jobs executed with possibly different Agents will look confusing. The setting converts log timestamps to the *Time Zone* specified with the user's profile.
- **Current Controller** applies when more than one Controller is connected to the same JOC Cockpit. The option that is offered in a number of views, for example the [History - Orders](/history-orders) view. When checked it limits display to Orders submitted to the currently selected Controller and otherwise will display Orders of any connected Controllers. The setting determines the default value for related *Current Controller* options in JOC Cockpit views.
- **Suppress tooltips for Inventory objects** relates to the Configuration-Inventory view that offers tooltips for example for [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties). Tooltips will pop up if the mouse is moved to the label of an input field to assist users in explaining possible input. While this is useful for users who are not familiar with JS7, tooltips might not be needed for experienced users.
- **License Warning acknowledged** refers to use of subscription licences that are typically limited to one year. Before license expiration related warnings will be displayed by JOC Cockpit. User can opt to suppress related license expiration warnings. For details see [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Show more options** activates the related slider button in the Configuration-Inventory view. It offers more detailed options for job configuration, for example with the [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options) tab.
- **Collapse list variable** applies to the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view that offers specifying Workflow Variables from a number of data types. If the *List* data type (array) is used then it can hold a larger number of entries. Users might not want to immediately see list variables expanded when editing a Workflow.

### View Type Settings

- **Show View** applies to a number of views that offer the related indicator from the right upper corner of the window. The setting specifies the view type that will be used by default. Users can change the view type on demand in any view. The *Card* view type requires more space on the screen than the *List* view type. However, some users might prefer visibility from cards.
- **Show Orders Overview** is similar to the *Show View* setting but applies to the [Orders - Overview](/orders-overview) view. In addition, the view offers the *Bulk* view type that allows to transition Orders from bulk operations.

### Workflow Layout

- **Orientation** offers to switch display of Workflows in the [Configuration - Inventory - Workflows](/configuration-inventory-workflows) view to vertical or horizontal presentation. Working with a wide screen using horizontal *Orientation* brings benefits when designing Workflows with a larger number of Jobs and other Workflow Instructions.
- **Spacing between Instructions on adjacent layers**
- **Spacing between Instructions on the same layer**
- **Round Edges for Connections**

## References

### Context Help

- [Cleanup Service](/service-cleanup)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Profile - Preferences](/profile-preferences)
- [Settings - Daily Plan](/settings-daily-plan)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
