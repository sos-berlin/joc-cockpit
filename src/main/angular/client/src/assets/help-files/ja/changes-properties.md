# プロパティの変更

JOC Cockpit では、ワークフローなどのオブジェクトに対して[JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) を管理することができます。変更は、共通の展開操作の対象となるインベントリオブジェクトの集まりです。

- コントローラへの展開
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import) を使用したロールアウト、
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface) を使用したロールアウト。

変更には、ワークフロー、スケジュールなどのインベントリオブジェクトや、ワークフローによって参照されるジョブリソースなどの参照オブジェクトが含まれます。

- ユーザーはインベントリ・オブジェクトを直接変更に追加することができます。
- 参照オブジェクトは自動的に変更に関連付けられます。

変更 - プロパティ]ポップアップウィンドウは変更のプロパティを指定するために使用します。

## 変更プロパティ

変更には以下のプロパティがあります：

- **Name**はユーザが変更に割り当てる一意の名前です。
- **タイトル**は変更の目的を説明します。
- **Status**は*Open*または*Closed*のいずれかです。クローズされた変更は、ディプロイメントまたはエクスポート操作では提供されません。

## 参考文献

### コンテキストヘルプ

-[Changes](/changes)

###Product Knowledge Base

-[JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
-[JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
-[JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)

