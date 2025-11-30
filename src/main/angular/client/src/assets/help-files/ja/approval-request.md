# 承認リクエスト

[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) は、オーダーの追加やキャンセルなど、2番目のユーザの承認を必要とする操作のために提供されます。これには、スケジュールオブジェクトを変更する操作も含まれます。

承認プロセスには、以下の役割が含まれます：

- 要求者*は、承認が必要な操作の実行を要求します。
- 承認者*は、承認要求を確認または拒否します。

承認プロセスの基本機能は次のとおりです：

- 4-eyesの原則を実装するため： *Approver*は、介入を実行する前に、*Requestor*のアカウント、ロール、および権限の範囲で介入を確認する必要があります。 
- 保留中の承認リクエストを追跡します。
- 複数の *Approvers* にフォールバックを提供するため。

## 承認リクエスト

承認リクエストは、ユーザーが承認の対象となる操作を実行しようとしたときに追加されます。前提条件は以下の通りです：

- ユーザーに*Requestorロール*が割り当てられていること。ロール名については、[Settings - JOC Cockpit](/settings-joc) を参照してください。
- 現在の操作は、*Requestor Role*の権限で表示されます。

例えば、「*Requestor Role*」がオーダーの権限を指定し、ワークフローにオー ダーを追加しようとしている場合、ポップアップウィンドウが表示され、以下の情報項目が指定さ れます：

- **タイトル**は、承認依頼のインジケータです。タイトル** は承認依頼のインジケータです。
- **承認者**は、[Approver Profiles](/approval-profiles) のリストから選択します。ただし、どの **承認者** でも承認依頼を承認または却下できます。
- **理由*** は、*Approver* に介入の必要性に関する説明を提供します。

承認リクエストが送信されると、[Approval Requests](/approval-requests) のビューに表示されます。関連する *Approver* は電子メールで通知を受け取ります。

##参照

### コンテキストヘルプ

-[Approval Notification Settings](/approval-notification-settings)
-[Approver Profiles](/approval-profiles)
-[Approval Requests](/approval-requests)

###Product Knowledge Base

-[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)

