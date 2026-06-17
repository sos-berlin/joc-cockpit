# Approval Requests

The [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) is offered for situations in which users intend performing operations such as adding or cancelling Orders that require approval by a second user. This can include any operation that modifies a scheduling object.

The Approval Process involves the following roles:

- A *Requestor* requests to perform an intervention that requires approval.
- An *Approver* confirms or denies the Approval Request.

The basic functionality of the Approval Process includes:

- to implement the 4-eyes principle: an *Approver* must confirm the intervention of a *Requestor* before the intervention can be executed in the scope of the *Requestor's* account, roles and permissions. 
- to keep track of pending Approval Requests.
- to offer fallback to a number of *Approvers*.

## List of Approval Requests

Approval Requests are added by users requesting confirmation for an intervention, see [Approval Request](/approval-request).

The list of Approval Requests is offered with the following properties:

- **Request Status Date** is the point in time the [Approval Request](/approval-request) was added.
- **Title** is specified by the *Requestor* when adding the Approval Request.
- **Requestor** indicates the user account that raised the Approval Request.
- **Request Status** is one of *requested*, *approved*, *withdrawn*, *executed*.
- **Approver** is the *First Name* and *Last Name* of the preferred *Approver*.
- **Approval Status** is one of *pending*, *approved*, *rejected*
- **Approval Status Date** is the most recent point in time the *Approver* was acting on the Approval Request, for example by approving or rejecting the request.
- **Request URL** is the [REST Web Service API](/rest-api) endpoint the *Requestor* wishes to use.
- **Category** indicates the scope of the request, for example being targeted to a Controller, to the Daily Plan etc.
- **Reason** indicates the explanation provided by the *Requestor* about the purpose of the Approval Request.

## References

### Context Help

- [Approval Notification Settings](/approval-notification-settings)
- [Approver Profiles](/approval-profiles)
- [Approval Request](/approval-request)
- [REST Web Service API](/rest-api)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
