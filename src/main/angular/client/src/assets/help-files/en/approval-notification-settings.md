# Approval Notification Settings

The [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) is offered for situations in which users intend performing operations such as adding or cancelling Orders that require approval by a second user. This can include any operation that modifies a scheduling object.

The Approval Process involves the following roles:

- A *Requestor* requests performing an intervention that requires approval.
- An *Approver* confirms or denies the Approval Request.

The basic functionality of the Approval Process includes:

- to implement the 4-eyes principle: an *Approver* must confirm the intervention of a *Requestor* before the intervention can be executed in the scope of the *Requestor's* account, roles and permissions. 
- to keep track of pending Approval Requests.
- to offer fallback to a number of *Approvers*.

## Approval Notification Settings

Notification Settings include properties for sending mail to *Approvers* in case of incoming [Approval Requests](/approval-requests):

- **Job Resource** holds settings for the connection to the mail server. For details see [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource).
- **Content Type**, **Charset**, **Encoding** are common to any system sending mail.
- **Approval Request E-Mail**
  - **Cc**, **Bcc** optionally indicate recipients of copies and carbon copies of the notification.
  - **Subject**, **Body** of mail can include placeholders that will be substituted when sending mail. Placeholders are specified using the format $\{placeholder\}.
    - The following placeholders are available:
      - $\{RequestStatusDate\}: Request Status Date
      - $\{ApprovalStatusDate\}: Approval Status Date
      - $\{Title\}: Request Title
      - $\{Requestor\}: Requestor account
      - $\{RequestStatus\}: Request Status, one of REQUESTED, EXECUTED, WITHDRAWN
      - $\{Approver\}: Approver account
      - $\{ApprovalStatus\}: Approval Status, one of APPROVED, REJECTED
      - $\{RequestURI\}: Request URI
      - $\{RequestBody\}: Request body holding the details of the REST API request
      - $\{Category\}: Category
      - $\{Reason\}: Reason
    - In addition, the following placeholders can be used if specified from a Job Resource such as *eMailDefault*.
      - $\{jocURL\}: URL from which JOC Cockpit is accessible.
      - $\{jocURLReverseProxy\}: same functionality as *jocURL*, but specifies the URL as available from a Reverse Proxy

## References

### Context Help

- [Approval Notification Settings](/approval-notification-settings)
- [Approval Request](/approval-request)
- [Approval Requests](/approval-requests)
- [Approver Profiles](/approval-profiles)

### Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)
