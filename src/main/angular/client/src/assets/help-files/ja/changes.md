# 変更の管理

JOC Cockpitはワークフローなどのオブジェクトに対する[JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) 。変更は、共同展開操作の対象となるインベントリオブジェクトのリストとみなされます。

- コントローラへの展開
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import) を使用したロールアウト、
-[JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface) を使用したロールアウト。

変更には、ワークフロー、スケジュールなどのインベントリオブジェクトや、ワークフローによって参照されるジョブリソースなどの参照オブジェクトが含まれます。

- ユーザーはインベントリオブジェクトを直接変更に追加することができます。
- 参照オブジェクトは自動的に変更に関連付けられます。

変更の追加、更新、削除には *変更の管理* ページを使用します。

## 変更一覧

既存の変更は一覧から表示されます：

- **アクションメニュー**では変更エントリの更新と削除ができます。
- **名前**はユーザーが変更に付ける固有の名前です。
- **タイトル**は変更の目的を説明します。
- **Status**は*Open*または*Closed*のいずれかです。クローズされた変更は、配置またはエクスポート操作では提供されません。
- **所有者**は、変更を所有するアカウントを示します。
- **Objects**は、変更の対象となるオブジェクトを表示するアイコンです。

## 変更に対する操作

画面上部から以下のボタンが利用できます：

- **変更の追加**は変更を追加します。[Changes - Properties](/changes-properties) から詳細を検索します。

変更リスト*から、関連する3つの点のアクションメニューと共に以下の操作が可能です：

- **編集** 変更のプロパティを更新できます。詳細は[Changes - Properties](/changes-properties) から検索してください。
- **Delete**は変更エントリーを削除します。

## 参考文献

### コンテキストヘルプ

-[Changes - Properties](/changes-properties)

###Product Knowledge Base

-[JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
-[JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
-[JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)

