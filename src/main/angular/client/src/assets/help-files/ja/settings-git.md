# 設定 - Git

JOC Cockpitでは、Gitリポジトリを使用したスケジューリングオブジェクトのバージョン管理とロールアウトを[JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration) 。

メニューバーの ![wheel icon](assets/images/wheel.png) アイコンから *設定* ページにアクセスできます。

Gitリポジトリを使用する場合、以下の設定が適用されます。変更は即座に有効になります。

## Git リポジトリの設定

### 設定 *git_hold_workflows*, Default： *ロールアウト

ワークフローをその環境にローカルなものとみなすか、Git でロールアウトするものとみなすかを指定します。

### 設定： *git_hold_resource_locks*, Default： *ロールアウト*。

[Resource Locks](/resources-resource-locks) をローカル環境とみなすか Git でロールアウトするかを指定します。

### 設定： *git_hold_file_order_sources*, Default： *rollout*

ファイルオーダーソースを、その環境にローカルなものとみなすか Git でロールアウトするものとみなすかを指定します。

### 設定： *git_hold_notice_boards*, Default： *rollout*。

[Notice Boards](/resources-notice-boards) をローカル環境とみなすか Git でロールアウトするかを指定します。

### 設定： *git_hold_script_includes*, Default： *rollout*。

スクリプトインクルードを、その環境にローカルなものとみなすか Git でロールアウトするものとみなすかを指定します。

### 設定： *git_hold_job_templates*, Default： *rollout*

ジョブテンプレートがローカル環境向けなのか Git でロールアウトするためのものなのかを指定します。

### 設定： *git_hold_job_resources*, Default： *local*

ジョブリソースをその環境にローカルなものとみなすか、Git でロールアウトするものとみなすかを指定します。

### 設定： *git_hold_calendars*, デフォルト： *ローカル*。

カレンダーをその環境にローカルなものとみなすか、Git でロールアウトするものとみなすかを指定します。

### 設定： *git_hold_schedules*, デフォルト： *local*

スケジュールをその環境のローカルなものとみなすか Git でロールアウトするものとみなすかを指定します。

## 参照

### コンテキストヘルプ

-[Profile - Git Management](/profile-git-management)
-[Resources - Notice Boards](/resources-notice-boards)
-[Resources - Resource Locks](/resources-resource-locks)
-[Settings](/settings)

###Product Knowledge Base

-[JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
-[JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

