# リソース - 通知ボード

*通知ボード* 画面には、通知ボードの使用状態が表示されます。

通知ボードは、通知を使用することで、ワークフロー間の依存関係を提供します。通知とは、通知ボードに通知されているか、存在しないかのフラグです。通知ボードは以下の種類が利用できます：

- **グローバル通知ボード**は全体範囲で *通知* を提供、どのワークフローでもいつでも同じ通知を利用できるようにします。 
- **スケジューリング通知ボード**は[実行計画](/daily-plan) の範囲で通知を提供します。通知は *実行計画* の日付ごとに存在したり、存在しなかったりします。例えば、
  - ワークフロー 1 は月～金に実行、
  - ワークフロー 2 は月～日に実行され、前回のワークフロー 1 の実行に依存します。
  - 週末はワークフロー 1 は開始されません。ワークフロー 2 が週末に開始できるように、依存関係は *スケジューリング通知ボード* を使用して実行計画にマッピングされます： ワークフロー 1 のオーダーが発行されない場合、依存関係は無視されます。

*通知ボード*は、ワークフロー内で以下の指示から参照されます：

- **PostNotices命令**は1つ以上の *通知* を投稿します。
- **ExpectNotices命令**は、1つ以上の *通知* を待ちます。
- **ConsumeNotices命令** は、ブロック命令です。
  - 同じワークフロー内の複数のジョブやワークフロー命令にまたがることができます、
  - 1 つ以上の *通知* を待ち、ブロックの完了時に *通知* を削除します。

## ナビゲーションパネル

左側のパネルには通知ボードを保持するインベントリーフォルダのツリーが表示されます。

- フォルダーをクリックすると、そのフォルダーの通知ボードが表示されます。
- フォルダーにマウスカーソルを合わせると表示される三角アイコンをクリックすると、そのフォルダーおよびすべてのサブフォルダーに設定されている通知ボードが表示されます。

検索アイコンをクリックすると、ユーザー入力によるお知らせボードの検索ができます：

- **Test** と入力すると、*test-board-1* や *test-board-2* といった名前の通知ボードが検索されます。 
- **\*Test** と入力すると、*test-board-1* や *my-TEST-board-2* といった名前の通知ボードが検索されます。

## 通知ボード画面

*通知ボード* 画面では、関連する *通知* や *オーダー* を表示します。

[実行計画 - 依存関係](/daily-plan-dependencies) 表示は、特定の実行計画に関連する *通知ボード* や *通知*、および *オーダー* が表示されます。

### 通知ボードの表示

以下の情報が表示されます：

- **名称** は、一意の通知ボードの名前です。
- **配置日時** は、通知ボードが設置された日付です。
- **ステータス** は、通知ボードがコントローラにデプロイされていない場合、 *同期済* か *未同期* のいずれかです。
- **通知数** は、通知ボードにある *通知* 数を表します。
  - **グローバル通知ボード**は一意の *通知*を 保持します。
  - **スケジューリング通知ボード**は、実行計画日ごとの *通知* を保持します。
- **Expectオーダー数** は、*通知* を待っているオーダーの数を示します。

### 通知とオーダーの表示

三角アイコンをクリックすると、通知ボードが拡大され、Post済みの *通知* と、通知待ちの *オーダー* の詳細情報が表示されます。

### 通知ボードの操作

以下の操作が可能です：

- **Post Notice** は、*PostNotices 命令* と同様に、関連する *通知* をPostします。
- **通知削除** は **ConsumeNotides命令** と同様に、**通知** を削除します。

## 検索

[リソース - 通知ボード - 検索](/resources-notice-boards-search) 例えば、特定のジョブ名を含むワークフローを検索すると、そのワークフローで使用されている通知ボードが返されます。

## 参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー- 通知ボード](/configuration-inventory-notice-boards)
- [実行計画](/daily-plan)
- [実行計画 - 依存関係](/daily-plan-dependencies)
- [リソース - 通知ボード - 検索](/resources-notice-boards-search)

###Product Knowledge Base

- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

