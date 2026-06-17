# Configuration - Notification

JS7 provides Notifications in case of warnings and errors of JS7 products and in the event of failed jobs and workflows. Notifications can also be sent in case of successful execution of Jobs and Workflows.

- Notifications are based on ongoing monitoring by the JOC Cockpit from the [Monitor Service](/service-monitor) and are visualized in the [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor) view. This includes:
  - monitoring availability of Controller and Agents,
  - monitoring execution of Workflows and Jobs.
- Notifications are forwarded by one of the following means:
  - by e-mail, for details see [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) and [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs).
  - by using a CLI tool such as a System Monitor Agent for [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor), for details see [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment).

Notifications are managed from the Configuration->Notification sub-view in the JOC Cockpit. The configuration is stored in XML format and is validated against the *Assigned XSD Schema* indicated at top of the page.

The page is split into the *Navigation Panel* on the left and the *Details Panel* on the right. 

- The *Details Panel* offers input fields and related documentation per element.
- When entering configuration details, they will be stored automatically within 30s and when leaving the page.

The typical lifecycle when changing Notifications includes

- entering configuration details,
- hitting the *Validate* button to verify that the configuration is consistent,
- hitting the *Release* button to activate the configuration.

## Navigation Panel

Configuration is offered from navigation by elements. Clicking an element name will open the element and will display available sub-elements. The arrow indicator left to the element name tells if sub-elements are available.

An element's 3-dots action menu offers the following operations:

- **Add Child Node** offers adding nodes to the current element. Available node types are indicated.
- **Show all Child Nodes of selected Node** brings forward a pop-up window that displays possible child nodes. This includes traversing child nodes and looking up child nodes by name.
- **Copy/Paste** offers copying a node including child nodes. Pasting is available from the parent node's action menu.
- **Remove** will remove the node and any child nodes.

### Fragments

#### MessageFragments

- **Message**
  - A *Message* defines the content which is sent, for example, by e-mail to a user or which is used to parameterize a command line utility, such as content to be forwarded to a System Monitor.
    - *Messages* for use with E-Mail represent the e-mail body used from plain text or from HTML.
    - Messages for use with the Command Line represent a string that can be used with the *CommandFragmentRef* element, see below.
    - *Message* elements can include Monitor Variables that are placeholders for values, e.g. for the Workflow Path, Order ID etc.
    - Any number of *Message* elements can be added.

#### MonitorFragments

The fragments come in a number of flavors for the following Notification types.

- **MailFragment**
  - The following elements are required to send mail:
    - **MessageRef**: Specifies the reference to a Message element that provides the e-mail body.
    - **Subject**: Specifies the e-mail subject and can include Monitor Variables.
    - **To**: Specifies the e-mail address of the recipient. Multiple recipients can be separated by comma.
  - The following elements are optional to send mail:
    - **CC**: The recipient of carbon copies. Multiple recipients can be separated by comma.
    - **BCC**: The recipient of blind carbon copies. Multiple recipients can be separated by comma.
    - **From**: The e-mail address of the account that is used to send mail. Consider that your mail server configuration determines whether a specific or an arbitrary account can be used.
- **CommandFragment**
  - **MessageRef**: Specifies the reference to a *Message* element which provides the content that will be forwarded with the Command element. The message content is available from the *$\{MESSAGE\}* Monitor Variable for use with later elements.
  - **Command**: Specifies the shell command for Linux/Windows which is used to forward Notifications, for example to a System Monitor utility.
    - For example, the following shell command can be used:
      - *echo "$\{MESSAGE\}" >> /tmp/notification.log*
      - The *echo* shell command appends the content of the *$\{MESSAGE\}* Monitor Variable to a file in the */tmp* directory.
- **JMSFragment**
  - The fragment type is used to integrate a Java Message Queue product which implements the JMS API. The values of the attributes are specific to the JMS product being used.

#### ObjectFragments 

- **Workflows**: Any umber of Workflow configurations can be added and are distinguished by a unique name that is assigned the element.
  - **Workflow**: A Workflow can be specified by its name. The *Path* attribute allows a regular expression specifying a part of the Workflow path.
    - **WorkflowJob**: The element can be used to limit Notifications to specific Jobs in a Workflow.
      - This includes the option of specifying the *Job Name* attribute and/or its *Label* attribute. For both attributes constant values and regular expressions can be used, for example *.\** to specify e-mail being sent for any Jobs.
      - For releases earlier to 2.7.1:
        - It is required that the criticality, which is one of *ALL*, *NORMAL* or *CRITICAL*, is specified when using the element.
      - For releases starting from 2.7.1:
        - The criticality can be one or more of *MINOR*, *NORMAL*, *MAJOR*, *CRITICAL*.
        - The *ALL* criticality is deprecated.
      - The **return_code_from** and **return_code_to** attributes can optionally be used to further limit Notifications to Jobs which complete with the given return code. The return code for Shell Jobs corresponds to the OS exit code.
    - Empty: If no *WorkflowJob* element is specified, then the Notification applies to any [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions) including the [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction), otherwise it will be applied to occurrences of the [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).

### Notifications

They activate the effective Notifications by references to the *Fragment* elements described above.

#### SystemNotification

- **SystemNotification**: Selects one or more of the above *MonitorFragments*. It is possible to select a number of *Fragments* of the same fragment type.
  - Notifications are created from system errors and warnings that are identified from JS7 product log files, see [Log Notification Service](/service-log-notification).
  - The element is used to populate the [Monitor - System Notifications](/monitor-notifications-system) sub-view of JOC Cockpit.

#### Notification

- **Notification**: Any number of Notifications can be added with each Notification being distinguished by a unique name. A Notification is assigned a type which can be any of *SUCCESS*, *WARNING* or *ERROR*. This allows Notifications being sent, for example in the event of Job errors and warnings. This similarly allows Notifications being specified for successful Workflow execution. Note that successful execution includes both the absence of Job errors and optionally the presence of Job warnings.
  - **NotificationMonitors**: Selects one or more of the above *MonitorFragments*. It is possible to select multiple fragments of the same fragment type.
    - **CommandFragmentRef**: Selects the *CommandFragment* used.
      - **MessageRef**: Selects the *Message* element used with the *Command*.
    - **MailFragmentRef**: Selects the *MailFragment* used in order to send Notifications by e-mail. If multiple *MailFragment* elements are referenced, then different types of e-mail can be used, for example for different recipients or with different content and layout of the e-mail body.
    - **JMSFragmentRef**: Selects the *JMSFragment* used to send Notifications to a Java Message Queue compatible product.
  - **NotificationObjects**: Selects the Workflows for which Notifications are created.
    - **WorkflowRef**: Selects a *Workflows* element that limits Notifications to related Workflows. Any number of Workflow references can be added.

## Operations on Notifications

The Notification page offers the following operations from related buttons at top of the page:

- **New**: starts from an empty configuration.
- **Remove**: deletes the current configuration.
- **Revert Draft**: creates a new draft from the most recently released version. Current changes will be lost.
- **Upload**: allows uploading an XML file holding the configuration.
- **Download**: offers downloading the configuration to an XML file.
- **Edit XML**: offers direct editing of the configuration in XML format.
- **Validate**: validates the configuration against an XSD Schema. This guarantees that the XML configuration is well-formed and formally correct.
- **Release**: publishes the configuration to JOC Cockpit. Changes become effective immediately.

## References

### Context Help

- [Log Notification Service](/service-log-notification)
- [Monitor - Agent Availability](/monitor-availability-agent)
- [Monitor - Controller Availability](/monitor-availability-controller)
- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Monitor Service](/service-monitor)

### Product Knowledge Base

- [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  - [JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    - [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    - [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
  - [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
- [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
