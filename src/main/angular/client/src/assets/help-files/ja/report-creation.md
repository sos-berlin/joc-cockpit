# レポートの作成

[JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports) は過去のワークフローとジョブの実行から得られた洞察を提供します：

- レポートは[Configuration - Inventory - Reports](/configuration-inventory-reports) からパラメータ化された定義済みの[Report Templates](/report-templates) から作成されます。
- ユーザーは *Report Creation* ビューまたは[JS7 - Reports - Automation](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Automation) からレポートを実行します。[Report - Run History](/report-run-history) ビューは、過去のレポート実行に関するエビデンスを提供します。
- レポートは[Reports](/reports) ビューで視覚化されます。

## レポート構成の表示

レポートは[Configuration - Inventory - Reports](/configuration-inventory-reports) ビューで構成されます。

レポートの構成が利用可能です 

- レポート構成へのナビゲーションを提供する*フォルダ パネル*から利用できます。
- 選択したレポート構成の詳細を表示する*レポート構成パネル*から利用できます。

### フォルダパネル

このパネルでは、レポート構成を保持するインベントリフォルダをナビゲートできます：

- フォルダを選択すると、*レポート構成パネル*に利用可能なレポート構成が表示されます。
- フォルダを選択すると、利用可能なレポート構成が*レポート構成パネル*に表示されます。指定したフォルダの*シェブロン-ダウン*アイコンをクリックすると、現在のフォルダとサブフォルダのレポート構成が再帰的に表示されます。
- chevron-up*アイコンをクリックすると、現在のフォルダが折りたたまれます。

### レポート構成パネル

このパネルには、現在選択されているフォルダから利用可能なレポート構成が表示されます。レポート構成は以下のプロパティで表示されます：

- **Name**は[Configuration - Inventory - Reports](/configuration-inventory-reports) ビューから指定されたレポート構成の一意の名前を示します。
- **レポート テンプレート**は使用中の[Report Template](/report-templates) を示します。
- **Frequencies**は、*Report Period*を等しい単位に分割する*Report Frequencies*を示します。
- **開始月**、終了月**は、*レポート期間*の開始日と終了日を示します。

## レポートの作成

レポートはレポート構成の3ドットアクションメニューから*レポートの実行*操作を使って作成できます。

ユーザーは複数のレポート構成を選択し、画面右上のボタンから*レポート実行*の一括操作を適用できます。

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Reports](/configuration-inventory-reports)
-[Reports](/reports)
-[Report - Run History](/report-run-history)
-[Report Templates](/report-templates)

###Product Knowledge Base

-[JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
-[JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
-[JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)

