# 設定 - インベントリ - レポート

レポートパネル*ではワークフローやジョブの実行に関するレポートを指定することができます：

- レポート構成はJOCコックピット*構成*ビューで利用可能なインベントリから管理されます。レポート構成はJOCコックピットの*Configuration*ビューで利用可能なインベントリから管理されます：
  - **例えば、失敗したワークフローの上位 10 件、失敗したジョブの上位 100 件などです。完全なリストについては、[Report Templates](/report-templates) を参照してください。
  - **レポート期間**は、項目がレポートされる日付範囲です。日付範囲は絶対または相対のどちらでもかまいません。
  - レポート頻度**は、*レポート期間**を同じ時間単位、例えば週または月に分割します。
- レポートの実行と可視化は、JOCコックピットの*Reports*ビューから利用できます。

レポートは以下のパネルから管理できます：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) は、Reports を保持するフォルダによるナビゲーションを提供します。また、このパネルではレポートに対する操作を行うことができます。
- ウィンドウ右側の*レポートパネル*はレポート設定の詳細を保持します。

## レポートパネル

レポートでは以下の入力が可能です：

- **Name**はレポートの一意の識別子です。[Object Naming Rules](/object-naming-rules) を参照してください。
- **タイトル**はレポートの目的を説明します。 
- **レポート テンプレート**は、使用する[Report Template](/report-templates) を指定します。
- **レポート期間**は日付範囲を指定します：
  - **から**まで
    - *報告期間**の開始月と終了月の月数を指定します。例えば、先月は*1m*から*1m*までです。
  - **calculated**
    - *単位*は*年*、*月*、*四半期*のいずれかです。
    - *From*は、*レポート期間*の開始単位となる過去の単位数を指定します。
    - *Count*は、*Report Period*が終了する過去の単位数を指定します。
  - **プリセット**は、*先月*、*今四半期*、*最終四半期*、*今年*、*昨年*のような定義済みの日付範囲の数から選択することができます。
- **ソート
  - **最高**：最高**： レポートは最高値の上位n個の値を返します。
  - **最下位**：このレポートは、上位 n 個の最低値を返します。
- **レポート頻度**は、レポート期間を同じ時間単位に分割します：
  - *毎週
  - *2週間ごと
  - *月毎
  - *3ヶ月ごと
  - *6ヶ月ごと
  - *yearly*

## 報告書の運用

一般的な操作については[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照。

レポートに関する操作は、以下のビューから実行できます：

- レポートは[Report - Creation](/report-creation) ビューから作成します。
- レポートの実行は、[Report - Run History](/report-run-history) ビューから利用できます。
- レポートは[Reports](/reports) ビューから視覚化できます。

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Object Naming Rules](/object-naming-rules)
-[Reports](/reports)
-[Report - Creation](/report-creation)
-[Report - Run History](/report-run-history)
-[Report Templates](/report-templates)

###Product Knowledge Base

-[JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
-[JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
-[JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)

