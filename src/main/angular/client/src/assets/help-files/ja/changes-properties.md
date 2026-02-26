# 変更管理 - プロパティ

JOCコックピットでは、ワークフローなどのオブジェクトに対して[JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) を変更管理することができます。変更は、共通の配置操作の対象となるインベントリーオブジェクトの集まりです。

- コントローラーへの配置
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import) を使用した配置
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface) を使用したロールアウト

変更には、ワークフロー、スケジュールなどのインベントリーオブジェクトや、ワークフローによって参照されるジョブリソースなどの参照オブジェクトが含まれます。

- ユーザーはインベントリーオブジェクトを直接変更に追加することができます。
- 参照オブジェクトは自動的に変更に関連付けられます。

*変更管理 - プロパティ* ポップアップウィンドウは変更の項目を指定するために使用します。

## 変更

変更には以下の項目があります：

- **名称**はユーザが変更に割り当てる一意の名前です。
- **タイトル**は変更の目的などを説明します。
- **ステート**は *Open* または *Closed* のいずれかです。クローズされた変更は、配置またはエキスポート操作では提供されません。

## 参考文献

### コンテキストヘルプ

- [変更管理](/changes)

###Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)

