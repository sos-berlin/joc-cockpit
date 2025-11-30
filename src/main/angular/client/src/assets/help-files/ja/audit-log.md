# ♪監査ログ

監査ログ(*Audit Log*)は、スケジュールオブジェクトの変更を記録します。

## リクエスト

JOC Cockpitでは、すべてのユーザー操作はREST APIリクエストから実行されます。

リクエストは使用されるエンドポイントを識別し、矢印ダウンアイコンをクリックするとリクエストボディを表示します。

## カテゴリー

- **CONTROLLER**は、オンデマンドでオーダーを追加するようなコントローラの 操作を示します。
- **DAILYPLAN**は実行計画の変更を示します。
- **IDENTITY**はIDサービスの変更を示します。
- **INVENTORY** はワークフローの保存など、インベントリの変更を示します。

# 監査証跡

JOC Cockpit は、REST API 要求を追跡する *Audit Trail* を書き込むように構成できます。監査証跡*にはユーザーセッションに関する情報が含まれ、JOC Cockpit GUIからは利用できません。

この*Audit Trail*は管理者が有効にすることができ、ディスク上のログファイルから利用できます。

## 参考文献

-[JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
-[JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)

