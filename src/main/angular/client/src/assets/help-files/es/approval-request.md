# Approval Request

The [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) is offered for situations in which users intend performing operations such as adding or cancelling Orders that require approval by a second user. This can include any operation that modifies a scheduling object.

The Approval Process involves the following roles:

- A *Requestor* requests performing an intervention that requires approval.
- An *Approver* confirms or denies the Approval Request.

The basic functionality of the Approval Process includes:

- to implement the 4-eyes principle: an *Approver* must confirm the intervention of a *Requestor* before the intervention can be executed in the scope of the *Requestor's* account, roles and permissions. 
- to keep track of pending Approval Requests.
- to offer fallback to a number of *Approvers*.

## Approval Request

Approval Requests are added when a user tries to perform an operation that is subject to approval. Prerequisites include:

- The user is assigned the *Requestor Role*. For the role's name see [Settings - JOC Cockpit](/settings-joc).
- The current operation is indicated with the permissions of the *Requestor Role*.

For example, if the *Requestor Role* specifies permissions for Orders and the user is trying to add an Order to a Workflow, then a pop-up window will be displayed that asks specifying the following information items:

- **Title** is the indicator of the Approval Request. Users can freely specify the *Title*.
- **Approver** is selected from the list of [Approver Profiles](/approval-profiles). The indicated*Approver* will be preferably notified. However, any *Approver* can approve or reject the Approval Request.
- **Reason** provides an explanation to the *Approver* about the need for the intervention.

When the Approval Request is submitted, then it will become visible in the [Approval Requests](/approval-requests) view. The related *Approver* will receive notification by e-mail.

## References

### Context Help

- [Approval Notification Settings](/approval-notification-settings)
- [Approver Profiles](/approval-profiles)
- [Approval Requests](/approval-requests)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
