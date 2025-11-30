# リソース - 掲示板

掲示板*ビューには、掲示板の使用に関するライブ情報が表示されます。

通知ボードは、通知を使用することで、ワークフロー間の依存関係を実装します。ノーティスとは、ノーティスボードにアタッチされているか、存在しないかのフラグです。通知ボードは以下のフレーバーから利用できます：

- **グローバル通知ボード**はグローバルスコープで通知*を実装し、どのワークフローでもいつでも同じ通知を利用できるようにします。 
- **スケジューリング可能な通知ボード**は[Daily Plan](/daily-plan) のスコープで通知を実装します。通知は*実行計画*の日付ごとに存在したり、存在しなかったりします。
  - ワークフロー 1 は月～金。
  - ワークフロー 2 は月～日に実行され、前回のワークフロー 1 の実行に依存します。
  - 週末はワークフロー 1 は開始されません。ワークフロー 2 が週末に開始できるように、依存関係は *Schedulable Notice Boards* を使用して実行計画にマッピングされます： ワークフロー 1 のオーダーが発表されない場合、依存関係は無視できます。

*通知ボード*は、ワークフロー内で以下の指示から参照されます：

- **PostNotices命令**は1つ以上の*Notices*を投稿します。
- **ExpectNotices命令**は、1つ以上の*Notices*が存在するのを待ちます。
- **ConsumeNotices命令** は、ブロック命令です。
  - 同じワークフロー内の複数のジョブやワークフロー命令にまたがることができます、
  - は、1 つ以上の *Notices* が存在することを待ち、ブロックの完了時に *Notices* を削除します。

## ナビゲーションパネル

左側のパネルには通知ボードを保持するインベントリフォルダのツリーが表示されます。

- フォルダをクリックすると、そのフォルダのお知らせボードが表示されます。
- フォルダをクリックすると、そのフォルダのお知らせボードが表示されます。

クイック検索アイコンをクリックすると、ユーザー入力によるお知らせボードの検索ができます：

- Test**」と入力すると、「*test-board-1*」や「*test-board-2*」といった名前の掲示板が表示されます。 
- Test** と入力すると、*test-board-1* や *my-TEST-board-2* といった名前の掲示板が表示されます。

## 掲示板パネル

掲示板*、関連する*お知らせ*、オーダーを中心に表示します。

[Daily Plan - Dependencies](/daily-plan-dependencies) 表示は、特定の実行計画に関連する*お知らせボード*、*お知らせ*、およびオーダーの表示に重点を置いています。

### 通知ボードの表示

以下の情報が表示されます：

- **掲示板の名前です。
- **通知ボードが設置された日付です。
- 通知ボードがコントローラにデプロイされていない場合、**Status** は *Synchronized* と *Not Synchronized* のいずれかです。
- **Notice Number of Notices** は、Notice Board の *Notice* 数を表します。
  - **グローバルノーティスボード**は一意の*ノーティス*を保持します。
  - **スケジュール可能な通知ボード**は、実行計画日ごとの*通知*を保持します。
- **予定オーダー数**は、*Notice*が掲示されることを期待しているオーダーの数を示します。

### 通知とオーダーの表示

矢印アイコンをクリックすると、掲示板が拡大され、掲示済みの*お知らせ*と、掲示待ちの*オーダーの詳細情報が表示されます。

### お知らせボードの操作

以下の操作が可能です：

- **お知らせの投稿** は、*PostNotices 命令* と同様に、関連する *お知らせ* を投稿します。
- お知らせの削除** **ConsumeNotides 指示** と同様に、**お知らせ** を削除します。

## 検索

[Resources - Notice Boards - Search](/resources-notice-boards-search) 例えば、特定のジョブ名を含むワークフローを検索すると、そのワークフローで使用されている通知ボードが返されます。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
-[Daily Plan](/daily-plan)
-[Daily Plan - Dependencies](/daily-plan-dependencies)
-[Resources - Notice Boards - Search](/resources-notice-boards-search)

###Product Knowledge Base

-[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  -[JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  -[JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  -[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  -[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  -[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

