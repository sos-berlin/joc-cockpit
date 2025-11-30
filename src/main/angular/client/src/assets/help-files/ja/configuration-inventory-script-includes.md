# 設定 - インベントリ - スクリプトの内容

スクリプトインクルードパネル* はジョブで使用するコードスニペットを指定することができます。詳細については[JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes) を参照してください。

シェルジョブは Bash, Python, PowerShell などのスクリプト言語に使用することができます。

- 例えば、多くの*ジョブスクリプト*で呼び出される再利用可能な関数などです。
- これは Bash などのシェルジョブにも当てはまりますし、ジョブでスクリプト言語を使用する場合にも当てはまります。
- スクリプトインクルードはワークフローがデプロイされる時に *ジョブスクリプト* に展開されます。つまり、スクリプトインクルードを変更するには、関連するワークフローをデプロイする必要があります。JS7 は依存関係を追跡し、スクリプトインクルードをリリースする際に関連ワークフローのデプロイを提供します。

スクリプトインクルードは以下のパネルで管理できます：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) では、スクリプト インクルードを保持するフォルダーごとにナビゲートできます。さらに、このパネルではスクリプト インクルードに対する操作を実行できます。
- ウィンドウの右側にある *Script Include Panel* には、スクリプト インクルード設定の詳細が表示されます。

## スクリプトインクルードパネル

スクリプトインクルードでは、以下の入力が可能です：

- **Name**はスクリプトインクルードの一意の識別子で、[Object Naming Rules](/object-naming-rules) を参照してください。
- **タイトル**には、スクリプト・インクルードの目的の説明を任意で入力します。
- **Script Include** はコード・スニペットです。

## スクリプトインクルードに対する操作

利用可能な操作については[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

## ジョブとの併用

ジョブは、以下の構文のいずれかを使用して、*ジョブスクリプト*プロパティからスクリプトを参照します：

- **\#\#include *script-include-name*** **:!
- **::!include *script-include-name***
- インクルード *script-include-name*** **//!include *script-include-name***

script-include-name*は、スクリプト・インクルードの識別子を指定します。ユーザーは上記の入力を*ジョブスクリプト*に入力し、クイック検索を呼び出すことができます。

### クイック検索

カーソルが*ジョブスクリプト*内にあるときにCTRL+Spaceキーボードショートカットを押すと、スクリプトインクルードのクイック検索が起動します：

- クイック検索は 
  - インベントリフォルダからのナビゲーション
  - クイック検索はインベントリフォルダからのナビゲーションを提供します。
- クイック検索は大文字と小文字を区別しません。クイック検索は大文字と小文字を区別せず、右から切り捨てます。左から切り捨てた入力には、任意の文字数のプレースホルダであるメタ文字を適用できます。
- スクリプトを選択すると、関連する入力がカーソルのある行に追加されます。

### パラメータ化

スクリプト・インクルードは、次のようにパラメータ化できます：

- **\#\#include *script-include-name* --replace="search-literal", "replacement-literal "**.
- **::!include *script-include-name* --replace="search-literal", "replacement-literal "** **/!include *script-include-name* --replace="search-literal", "replacement-literal "** **/!
- **//!include *script-include-name* --replace="search-literal", "replacement-literal "** **:!

search-literal*はスクリプトインクルードで検索され、関連するジョブを保持するワークフローがデプロイされるときに*replacement-literal*で置き換えられます。

### 例

#### Unix 用 PowerShell

Unix プラットフォームで PowerShell を使用する場合、スクリプトのインクルードには次のように記述することをお勧めします：

<pre>
#usr/bin/env pwsh
</pre>

#### Windows 用 PowerShell

Windows プラットフォームで PowerShell を使用する場合、スクリプト・インクルードには次のようなシバンが推奨されます：

<pre>
setlocal enabledelayedexpansion &amp; set NO_COLOR=1 &amp; set f=%RANDOM%.ps1 &amp; @@findstr/v "^@@[fs].*&amp;" "%~f0" &gt; !f! &amp; powershell.exe -NonInteractive -File !f! &amp; set e=!errorlevel! &amp; del /q !f! &amp; exit !e!/b&amp;.
</pre>

スクリプト・インクルードは、*powershell.exe*バイナリで実行される一時ファイルに*ジョブ・スクリプト*の内容を書き込みます。それ以降のPowerShellバージョンが使用されている場合は、*pwsh.exe*バイナリの使用に切り替える必要があります。スクリプトエラーはJS7エージェントによって考慮され、ログ出力は色付けのためにエスケープ文字から取り除かれます。 

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
-[Object Naming Rules](/object-naming-rules)

###Product Knowledge Base

-[JS7 - How to run PowerShell scripts from jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+run+PowerShell+scripts+from+jobs)
-[JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)

