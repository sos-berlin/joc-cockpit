# ジョブ定義 - インベントリー - 通知ボード

*通知ボード* はワークフローで使用する通知ボードを指定します。詳細は[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards) を参照してください。

通知ボードはワークフロー間の依存関係を設定します：

- 通知ボードから、通知を追加できますす。 
  - ユーザーからは、[リソース - 通知ボード](/resources-notice-boards) を参照してください。
  - ワークフローの *PostNotices命令* からは、[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction) を参照してください。
- ワークフローは、オーダーが以下の命令からの通知を待ち受けるように設定できます：
  - *ExpectNotices命令* は、*PostNotices命令* またはユーザーによって追加された1つまたは複数の通知ボードから通知が利用可能かどうかを確認するために使用されます。通知が存在しない場合、デフォルトではオーダーは *待機中* のままとなります。ワークフローは、同じまたは異なる通知ボードからの通知を待ち受けるために、いくつでも *ExpectNotices命令* を含むことができます。詳細は[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction) を参照してください。
  - *ConsumeNotices命令* は、*PostNotices命令* またはユーザーによって追加された通知ボードからの1つまたは複数の通知をオーダーに待ち受けるために使用されます。*ConsumeNotices命令* は、他の命令を含むことができるブロック命令であり、オーダーが命令ブロックの終端に達したときに、その通知を削除します。詳細は[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction) を参照してください。

通知ボードには以下の種類があります：

- **グローバル通知ボード** は、グローバルスコープで通知を実装し、どのワークフローでもいつでも同じ 通知を利用できるようにします。
- **スケジューラブル通知ボード** は、[実行計画](/daily-plan) のスコープで通知を実装します。例えば、*実行計画* の日付の範囲で通知が存在します。例えば；
  - ワークフロー 1 は月～金。
  - ワークフロー 2 は月～日に実行され、ワークフロー 1 の実行に依存します。
  - 週末はワークフロー 1 は開始しません。ワークフロー 2 が週末に開始できるように、依存関係は *スケジューラブル通知ボード* を使用して実行計画にマッピングされます。

通知ボードは以下の画面で管理します：

- ウィンドウの左側にある[ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation) は、通知ボードを保持するフォルダをナビゲートします。また、このパネルでは通知ボードの操作が可能です。
- ウィンドウ右側の *通知ボードパネル* は、通知ボードの設定詳細を表示します。

## 通知ボードパネル

通知ボードの入力項目は以下の通りです：

- **名称** は、掲示板のユニークな識別子で、[オブジェクト命名規則](/object-naming-rules) に準じてください。
- **タイトル** は、通知ボードの目的などを説明するオプションです。
- **通知ボードタイプ** は、*グローバル* または *スケジューラブル* のいずれかです。

### グローバル通知ボード

- **通知ID（発信順）** は、定数値または発信オーダーから抽出できる式を指定できます：
  - 空の値を使用することも、定数値を指定する文字列を使用することもできます。
  - 下記のように正規表現も使用できます：
    - *実行計画日一致* は、オーダーIDの実行計画日から正規表現で抽出： *replaceAll($js7OrderId, '\^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.$', '$1')*
    - *実行計画日・オーダー名一致* は、オーダーIDから実行計画日とオーダー名を抽出： *replaceAll($js7OrderId, '\^#([0-9]{4}-[0-9]{2}-[0-9]{2})#.-([\^:])(?::[\^|])?([|].)?$’, ‘$1$2$3’)*
    - *オーダー名一致* は、オーダー名を抽出： *replaceAll($js7OrderId, '\^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.-([\^:])(?::[\^|]*)?([|].*)?$', '$1$2')*
- **通知ID（読み取り順）** は、*通知ID（発信順）* と同じ式の必要があります。

### スケジューラブル通知ボード

- **通知ID（読み取り順）** は、定数値または発信オーダーから抽出できる式を指定できます：
  - 空の値を使用することも、文字列で定数値を指定することもできます。
  - 下記のように正規表現も使用できます：
    - *オーダー名一致* は、オーダー名を抽出： *replaceAll($js7OrderId, '\^#[0-9]{4}-[0-9]{2}-[0-9]{2}#.-([\^:])(?::[\^|]*)?([|].*)?$', '$1$2')*

### 通知ボードの操作

利用可能な操作については[ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation) を参照してください。

## ワークフロー命令との併用

通知ボードのワークフロー命令には以下のオプションがあります：

- **PostNotices命令** は、通知が記録される通知ボードのリストを保持します。この命令にはオプションは必要ありません。
- **ExpectNotices命令**、**ConsumeNotices命令** は以下の項目が必要です：
  - **条件式**は、*true* または *false* と評価される1つまたは複数の通知ボードの条件を指定します：
    - "and" 条件として **&amp;&amp;**
    - "or" 条件として **||**
    - **()** は、条件が評価される優先順位を指定します。
    - 式中の通知ボード名はクオーテーションで囲む必要があります。
    - 例
      - **'NB1' &amp;&amp; 'NB2'** は、*NB1* と *NB2* の両方の通知ボードの通知が *true* と評価されることを期待します。
      - **( 'NB1' &amp;&amp; 'NB2' ) || 'NB3'** は、*NB1* と *NB2* からの通知が存在することを期待します。あるいは、*NB3* からの通知が存在する場合、この式は *true* と評価されます。
  - **通知されなかった場合** は、通知されなかった場合の動作を指定します。これは発信ワークフローからオーダーがない日に適用されます。
    - **待機** は、デフォルトで、通知が発信されたかどうかとは関係なく、オーダーは通知があるまで待機します。
    - **スキップ** は、通知が発信されていない場合、オーダーをスキップします。
    - **実行** は *ConsumeNotices命令* で使用可能で、オーダーがブロック命令に入ります。

##参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation)
- [実行計画 - 依存関係](/daily-plan-dependencies)
- [オブジェクト命名規則](/object-naming-rules)
- [リソース - 通知ボード](/resources-notice-boards)

###Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
-  [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

