# 構成 - 在庫 - 掲示板

通知ボードパネル*はワークフローで使用する通知ボードを指定します。詳細は[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards) を参照してください。

通知ボードはワークフロー間の依存関係を実装します：

- 通知ボードはワークフロー間の依存関係を実装します。 
  - ユーザーの介入から、[Resources - Notice Boards](/resources-notice-boards) を参照してください。
  - ワークフローの *PostNotices 命令* からは、[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction) を参照してください。
- ワークフローは、オーダーが以下のインストラクションからの通知を期待するように設定できます：
  - *ExpectNotices指示*は、*PostNotices指示*またはユーザーによって追加された1つまたは複数の通知ボードから通知が利用可能かどうかを確認するために使用されます。お知らせが存在しない場合、デフォルトではオーダーは*待機中*のままとなります。ワークフローは、同じまたは異なる通知ボードからの通知を期待するために、いくつでも*ExpectNotices指示*を含むことができます。詳細は[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction) を参照してください。
  - *ConsumeNotices命令*は、*PostNotices命令*またはユーザーによって追加された通知ボードからの1つまたは複数の通知をオーダーに期待させるために使用されます。ConsumeNotices命令*は、他の命令を含むことができるブロック命令であり、オーダーが命令ブロックの終端に達したときに、期待されていた通知を削除します。詳細は[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction) を参照。

通知ボードには以下のフレーバーがあります：

- **グローバル通知ボード**はグローバルスコープで通知を実装し、どのワークフローでもいつでも同じ 通知を利用できるようにします。
- **スケジューラブル通知ボード**は[Daily Plan](/daily-plan) のスコープで通知を実装します。例えば、*実行計画*の日付のスコープで通知が存在します。
  - ワークフロー 1 は月～金。
  - ワークフロー 2 は月～日に実行され、ワークフロー 1 の実行に依存します。
  - 週末はワークフロー 1 は開始しません。ワークフロー 2 が週末に開始できるように、依存関係は *Schedulable Notice Boards* を使用して実行計画にマッピングされます。

通知ボードは以下のパネルで管理します：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) は、通知ボードを保持するフォルダをナビゲートします。また、このパネルでは通知ボードの操作が可能です。
- ウィンドウ右側の*お知らせボードパネル*は、お知らせボードの設定詳細を表示します。

## お知らせボードパネル

掲示板の入力項目は以下の通りです：

- **Name**は掲示板のユニークな識別子で、[Object Naming Rules](/object-naming-rules) を参照してください。
- **タイトル** は通知ボードの目的を説明するオプションです。
- **Notice Board Type** は、*Global Notice Board* または *Schedulable Notice Board* のいずれかです。

### グローバル通知ボード

- **Notice ID for Posting Order** は、定数値または投稿オーダーに由来する式を保持します：
  - 空の値を使用することも、定数値を指定する文字列を使用することもできます。
  - 正規表現が使用できます：
    - *オーダー ID から実行計画日を正規表現で抽出します： *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*$', '$1')*
    - *デイリープランの日付とオーダー名のマッチング *式を使用して、オーダーIDからデイリープランの日付とオーダー名を抽出します： *replaceAll($js7OrderId, '^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2$3')*
    - *マッチングオーダー名*は、式を使ってオーダー名を抽出します： *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]*)(?::[^|]*)?([|].*)?$', '$1$2')*
- オーダー予定通知 ID**は、オーダー投稿通知 ID**と同じ式を保持する必要があります。

### スケジュール可能な掲示板

- **投稿オーダー**の通知IDは、定数値または投稿オーダーから派生した式を保持します：
  - 空の値を使用することも、文字列で定数値を指定することもできます。
  - 正規表現も使用できます：
    - マッチングオーダー名** 式を使ってオーダー名を抽出します： *replaceAll($js7OrderId, '^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.*-([^:]\*)(?::[^|]*)?([|].*)?$', '$1$2')*

### 掲示板での操作

利用可能な操作については[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

## ワークフロー指示との併用

掲示板用ワークフロー指示書には以下のオプションがあります：

- **PostNotices命令**は、Noticeが掲示されるNotice Boardsのリストを保持します。この指示にはオプションは必要ありません。
- **ExpectNotices命令**、**ConsumeNotices命令**は以下の入力を保持します：
  - **Expression**は、*true*または*false*と評価される1つまたは複数の通知ボードの条件を指定します：
    - and "条件としての**&amp;&amp;**。
    - "または "条件としての**||**。
    - **()**は条件が評価される優先順位を指定します。
    - 式中のボード名は引用符で囲む必要があります。
    - 例
      - **'NB1' &amp;&amp; 'NB2'**: *NB1*と*NB2*の両方の掲示板からのお知らせが*true*と評価されることを期待します。
      - **( 'NB1' &amp;&amp; 'NB2' ) || 'NB3'**: *NB1*と*NB2*からの通知が存在することを期待します。あるいは、*NB3*からの通知が存在する場合、この式は*true*と評価されます。
  - **通知されなかった場合**は、通知が通知されなかった場合の動作を指定します。これは投稿ワークフローからオーダーがない日に適用されます。
    - **Wait**はデフォルトで、お知らせが発表されたかどうかとは関係なく、オーダーはお知らせがあるまで待機します。
    - **Skip**は、お知らせが発表されていない場合、オーダーをスキップします。
    - **Process**は*ConsumeNotices命令*で使用可能で、オーダーがブロック命令に入ります。

##参照

### コンテキストヘルプ

-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Daily Plan - Dependencies](/daily-plan-dependencies)
-[Object Naming Rules](/object-naming-rules)
-[Resources - Notice Boards](/resources-notice-boards)

###Product Knowledge Base

-[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  -[JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  -[JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  -[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  -[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  -[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

