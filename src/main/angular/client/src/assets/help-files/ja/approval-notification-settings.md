# 承認通知設定

[JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process) は、オーダーの追加やキャンセルなど、他のユーザーの承認が必要な操作のために提供されます。これには、スケジューリングオブジェクトを変更する操作も含まれます。

承認プロセスには、以下の役割が含まれます：

- *承認依頼者*は、承認が必要な操作の承認を依頼します。
- *承認者*は、承認依頼を承認または拒否します。

承認プロセスの基本機能は次のとおりです：

- 4-eyesの原則（２名認証）のために、*承認者* は、*承認依頼者* が操作を実行する前に、*承認依頼者* のアカウント、ロール、および権限の範囲を確認する必要があります。 
- 保留中の承認依頼を追跡します。
- 複数の *承認者* の代替候補を複数提供します。

## 承認通知の設定

通知設定には、[承認依頼](/approval-requests) 登録時に *承認者* にメールを送信するための項目が含まれます：

- **ジョブリソース** は、メールサーバーへの接続を設定します。詳細は[JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource) を参照してください。
- **コンテンツタイプ**、**文字コード**、**文字エンコード** はメール送信システム共通です。
- **承認依頼メール**。
  - **Cc**、**Bcc**は、オプションで通知のコピーとカーボンコピーの受信者を示します。
  - メールの **件名**、 **本文** には、メール送信時に置換されるプレースホルダを含めることができます。プレースホルダーは${placeholder}という書式で指定します。
    - 指定できるプレースホルダーは以下の通りです：
      - ${RequestStatusDate}：依頼日時
      - ${ApprovalStatusDate}： 承認日時
      - ${Title} : タイトル
      - ${Requestor} : 依頼元
      - ${RequestStatus}: 承認ステータス（依頼済、実行済、取り下げのいずれか）
      - ${Approver} : 承認者
      - ${ApprovalStatus}：承認ステータス（承認、却下のいずれか）
      - ${RequestURI}：依頼URL
      - ${RequestBody}：REST APIの詳細を保持するリクエストボディ。
      - ${Category} : 種別
      - ${Reason} : 理由
    - さらに、*eMailDefault* のようなジョブリソースから指定する場合、以下のプレースホルダを使用できます。
      - ${jocURL} : JOCコックピットにアクセスできるURL。
      - ${JocURLReverseProxy}: *jocURL* と同じ機能ですが、リバースプロキシから利用可能なURLを指定します。

## 参照

### コンテキストヘルプ

- [承認通知設定](/approval-notification-settings)
- [承認プロセス](/approval-request)
- [承認依頼](/approval-requests)
- [承認者プロファイル](/approval-profiles)

###Product Knowledge Base

- [JS7 - Approval Process](https://kb.sos-berlin.com/display/JS7/JS7+-+Approval+Process)
- [JS7 - eMailDefault Job Resource](https://kb.sos-berlin.com/display/JS7/JS7+-+eMailDefault+Job+Resource)

