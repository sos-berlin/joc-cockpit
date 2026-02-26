# ジョブ定義 - インベントリー - 実行計画 - スクリプトインクルード

*スクリプトインクルード* ではジョブで使用するコードスニペットを設定することができます。詳細については[JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes) を参照してください。

Shell ジョブは Bash, Python, PowerShell などのスクリプト言語に使用することができます。

- 多くの *ジョブ* で呼び出せる再利用可能なコードスニペットです。
- これは Bash などのシェルジョブにも当てはまりますし、ジョブでスクリプト言語を使用する場合にも当てはまります。
- スクリプトインクルードはワークフローが配置される時に *ジョブ* に展開されます。つまり、スクリプトインクルードを変更するには、関連するワークフローを配置する必要があります。JS7 は依存関係を追跡し、スクリプトインクルードをリリースする際に関連ワークフローを配置します。

スクリプトインクルードは以下の画面で管理できます：

- ウィンドウの左側にある[ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation) では、スクリプトインクルードのフォルダーごとにナビゲーションできます。さらに、このパネルではスクリプトインクルードに対する操作を実行できます。
- ウィンドウの右側にある *スクリプトインクルード* には、スクリプト インクルード設定の詳細が表示されます。

## スクリプトインクルード

スクリプトインクルードでは、以下の入力が可能です：

- **名称** は、スクリプトインクルードの一意の識別子で、[オブジェクト命名規則](/object-naming-rules) を参照してください。
- **タイトル** は、スクリプトインクルードの目的などの説明を任意で入力します。
- **スクリプトインクルード** は、コードスニペットです。

## スクリプトインクルードに対する操作

利用可能な操作については[ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation) を参照してください。

## ジョブでの使用

ジョブは、以下の構文のいずれかを使用して、*ジョブプロパティ* からスクリプトを参照します：
- **\#\#!include *script-include-name* **
- **::!include *script-include-name* **
- **//!include *script-include-name* **

*script-include-name* は、スクリプトインクルードの識別子を指定します。ユーザーはこの識別子をジョブスクリプトに直接入力することで、クイック検索機能を利用できます。

## クイック検索

*ジョブスクリプト* 内でカーソルがある状態にあるときに、CTRL+Spaceキーボードショートカットを押すと、スクリプトインクルードのクイック検索が起動します：

- クイック検索は 
  - インベントリーフォルダーからのナビゲーション
  - 1文字以上の文字を入力すると、スクリプトインクルードを名前で選択できます。
- クイック検索は大文字と小文字を区別しません。クイック検索は大文字と小文字を区別せず、右から切り捨てます。左から切り捨てた入力には、任意の文字数のプレースホルダである＊メタ文字を適用できます。
- スクリプトを選択すると、カーソルのある行に追加されます。

### パラメーター化

スクリプト・インクルードは、次のようにパラメーター化できます：

- **\#\#!include *script-include-name* —replace=“search-literal”,“replacement-literal”**
- **::!include *script-include-name* —replace=“search-literal”,“replacement-literal”**
- **//!include *script-include-name* —replace=“search-literal”,“replacement-literal”**

*search-literal* はスクリプトインクルード内で検索され、関連するジョブを含むワークフローが配置される際に、*replacement-literal* に置き換えられます。

### 使用例

#### Unix 用 PowerShell

Unix プラットフォームで PowerShell を使用する場合、スクリプトのインクルードには次のようにシェバンが推奨されます：

<pre>
#!/usr/bin/env pwsh
</pre>

#### Windows 用 PowerShell

Windows プラットフォームで PowerShell を使用する場合、スクリプトインクルードには次のようなシェバンが推奨されます：

<pre>
@@setlocal enabledelayedexpansion &amp; set NO_COLOR=1 &amp; set f=%RANDOM%.ps1 &amp; @@findstr/v "^@@[fs].*&amp;" "%~f0" &gt; !f! &amp; powershell.exe -NonInteractive -File !f! &amp; set e=!errorlevel! &amp; del /q !f! &amp; exit !e!/b&amp;.
</pre>

スクリプトインクルードは、*powershell.exe*バイナリで実行される一時ファイルに *ジョブスクリプト* の内容を書き込みます。それ以降のPowerShellバージョンが使用されている場合は、*pwsh.exe* バイナリの使用に切り替える必要があります。スクリプトエラーはJS7エージェントによって考慮され、ログ出力は色付けのためにエスケープ文字から取り除かれます。 

## 参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation)
- [ジョブ定義 - インベントリー - ワークフロー - ジョブオプション](/configuration-inventory-workflow-job-options)
- [オブジェクト命名規則](/object-naming-rules)

###Product Knowledge Base

- [JS7 - How to run PowerShell scripts from jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+jobs)
- [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)

