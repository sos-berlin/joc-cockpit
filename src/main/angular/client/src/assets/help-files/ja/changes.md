# 変更管理

JOCコックピットはワークフローなどのオブジェクトに対する変更を管理できます。[JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) 。変更は、共通配置の対象となるインベントリーオブジェクトのリストとみなされます。

- コントローラーへの配置
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import) を使用した配置
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface) を使用したロールアウト。

変更には、ワークフロー、スケジュールなどのインベントリーオブジェクトや、ワークフローによって参照されるジョブリソースなどの参照オブジェクトが含まれます。

- ユーザーはインベントリーオブジェクトを直接変更に追加することができます。
- 参照オブジェクトは自動的に変更に関連付けられます。

変更の追加、更新、削除には *変更管理* 画面を使用します。

## 変更一覧

既存の変更は一覧から表示されます：

- **アクションメニュー** は、変更の編集と削除ができます。
- **名前** は、ユーザーが変更に付ける固有の名前です。
- **タイトル** は、変更の目的などを説明します。
- **ステート** は、*Open* または *Closed* のいずれかです。クローズされた変更は、配置またはエキスポート操作では提供されません。
- **所有者** は、変更を所有するアカウントを示します。
- **オブジェクト** は、変更の対象となるオブジェクトを表示するアイコンです。

## 変更に対する操作

画面上部から以下のボタンが利用できます：

- **変更の追加** は、変更を追加します。[変更管理 - プロパティ](/changes-properties) を参照してください。

*変更リスト* の、アクションメニューから以下の操作が可能です：

- **編集** は、変更のプロパティを更新できます。詳細は[変更管理 - プロパティ](/changes-properties) を参照してください。
- **削除** は、変更を削除します。

## 参照

### コンテキストヘルプ

- [変更管理 - プロパティ](/changes-properties)

###Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)

