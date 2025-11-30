# 承認通知の設定

[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) は、オーダーの追加やキャンセルなど、セカンドユーザの承認が必要な操作のために提供されます。これには、スケジューリングオブジェクトを変更する操作も含まれます。

承認プロセスには、以下の役割が含まれます：

- 要求者*は、承認が必要な操作の実行を要求します。
- 承認者*は、承認要求を確認または拒否します。

承認プロセスの基本機能は次のとおりです：

- 4-eyesの原則を実装するため： *Approver*は、介入を実行する前に、*Requestor*のアカウント、ロール、および権限の範囲で介入を確認する必要があります。 
- 保留中の承認リクエストを追跡します。
- 複数の *Approvers* にフォールバックを提供するため。

## 承認通知の設定

通知設定には、[Approval Requests](/approval-requests) 受信時に *Approvers* にメールを送信するためのプロパティが含まれます：

- **ジョブリソース**はメールサーバーへの接続設定を保持します。詳細は[JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource) を参照してください。
- **Content Type**, **Charset**, **Encoding** はメール送信システム共通です。
- **承認要求電子メール**。
  - **Cc**、**Bcc**は、オプションで通知のコピーとカーボンコピーの受信者を示します。
  - メールの **Subject**, **Body** には、メール送信時に置換されるプレースホルダを含めることができます。プレースホルダは${placeholder}という書式で指定します。
    - 指定できるプレースホルダは以下の通りです：
      - RequestStatusDate}：リクエストステータス日付
      - ApprovalStatusDate}：ApprovalStatusDate}: 承認ステータス日付
      - タイトルリクエストタイトル
      - RequestorRequestor account
      - RequestStatusRequest Status (REQUESTED、EXECUTED、WITHDRAWNのいずれか)
      - Approver承認者アカウント
      - ApprovalStatus}：Approval Status, one of APPROVED, REJECTED
      - RequestURI}：リクエストURI
      - RequestBody}：REST APIリクエストの詳細を保持するリクエストボディ。
      - Categoryカテゴリ
      - ReasonReason
    - さらに、*eMailDefault* のようなジョブリソースから指定する場合、以下のプレースホルダを使用できます。
      - jocURLJOCコックピットにアクセスできるURL。
      - jocURLReverseProxy}: *jocURL* と同じ機能ですが、リバースプロキシから利用可能なURLを指定します。

## 参照

### コンテキストヘルプ

-[Approval Notification Settings](/approval-notification-settings)
-[Approval Request](/approval-request)
-[Approval Requests](/approval-requests)
-[Approver Profiles](/approval-profiles)

###Product Knowledge Base

-[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
-[JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)

