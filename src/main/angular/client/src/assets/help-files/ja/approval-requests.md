# 承認リクエスト

[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) は、オーダーの追加やキャンセルなど、セカンドユーザの承認が必要な操作のために提供されます。これには、スケジュールオブジェクトを変更する操作も含まれます。

承認プロセスには、以下の役割が含まれます：

- 要求者*は、承認が必要な操作の実行を要求します。
- 承認者*は、承認要求を確認または拒否します。

承認プロセスの基本機能は次のとおりです：

- 4-eyesの原則を実装するため： *Approver*は、介入を*Requestor*のアカウント、ロール、および権限の範囲で実行する前に、*Requestor*の介入を確認する必要があります。 
- 保留中の承認リクエストを追跡します。
- 複数の *Approvers* にフォールバックを提供するため。

## 承認リクエストのリスト

承認リクエストは、介入に対する確認を要求するユーザーによって追加されます。[Approval Request](/approval-request) を参照してください。

承認リクエストのリストは以下のプロパティで提供されます：

- **Request Status Date** は、[Approval Request](/approval-request) が追加された時点です。
- **タイトル**は、承認依頼を追加するときに*Requestor*が指定します。
- **Requestor**は、承認依頼を発行したユーザーアカウントを示します。
- **Request Status** は *requested*、*approved*、*withdrawn*、*executed* のいずれかです。
- **Approver**は、優先する*Approver*の*First Name*と*Last Name*です。
- **Approval Status** は *pending*、*approved*、*reject* のいずれかです。
- **承認ステータスの日付**は、*Approver*が承認または却下など、承認リクエストに対応した最新の時点です。
- **Request URL** は、*Requestor* が使用したい[REST Web Service API](/rest-api) エンドポイントです。
- **Category**はリクエストのスコープを示します。たとえば、コントローラや実行計画などを対象としています。
- **Reason**は、承認リクエストの目的について*Requestor*が提供する説明を示します。

##参照

### コンテキストヘルプ

-[Approval Notification Settings](/approval-notification-settings)
-[Approver Profiles](/approval-profiles)
-[Approval Request](/approval-request)
-[REST Web Service API](/rest-api)

###Product Knowledge Base

-[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)

