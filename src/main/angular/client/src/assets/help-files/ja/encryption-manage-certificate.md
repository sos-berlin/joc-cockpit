# 暗号化証明書の管理

[JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) は、ジョブで使用される秘密を安全に扱う方法を提供します。ユーザは非対称鍵を使ってパスワードのような機密データを暗号化・復号化することができます。

詳細は[Manage Encryption Keys](/encryption-manage-keys) を参照してください。

暗号化証明書の管理* ページは、証明書のプロパティを指定するために使用されます。

## 証明書

証明書には以下のプロパティがあります：

- **証明書エイリアス** は、ユーザが証明書につけるユニークな名前です。ユーザーは自由に名前を決めることができます。証明書とプロパティは、指定された名前を使用してジョブ・リソースに保存されます。
- **Certificate**では、PEM形式の証明書をコピー/ペーストすることができます。証明書は以下のようになります：

<pre>
-----証明書は以下のようになります。
MIIB9TCCAZqgAwIBAgIJAIFT2KH9txb9MAoGCCqGSM49BAMCMFgxCzAJBgNVBAYT
AkRFMQ8wDQYDVQQIDAZCZXJsaW4xDzANBgNVBAcMBkJlcmxpbjEMMAoGA1UECgwD
U09TMQswCQYDVQQLDAJJVDEMMAoGA1UEAwwDSlM3MB4XDTI0MDYyNzA5MzU0MloX
DTI5MDYyNjA5MzU0MlowWDELMAkGA1UEBhMCREUxDzANBgNVBAgMBkJlcmxpbjEP
MA0GA1UEBwwGQmVybGluMQwwCgYDVQKDANTT1MxCzAJBgNVBAsMAklUMQwwCgYD
VQQDDANKUzcwVjAQBgcqhkjOPQIBBgUrgQQACgNCAATBF6yXinah6K/x2TikPNaT
447gK2SxCH8vgO5NygZzUonzhaGOK5n1jktvhhmxmrn5V4VSHMC0NzU6O87nUKpA
o1AwTjAdBgNVHQ4EFgQUcovwh3OMrSXjP02VHG5cj03xHxswHwYDVR0jBBgwFoAU
covwh3OMrSXjP02VHG5cj03xHxswDAYDVR0TBAUwAwEB/zAKBggqhkjOPQQDAgNJ
ADBGAiEAwjGLIhLfV0q/cOYVAnXSZ+jWp8Og/lG5YdvtLcj9CD0CIQCK8O4wURQj
SbNCv0bJswLadTFEcz8ZoYP7alXJzj9FQQ== 
-----終了証明書
</pre>

- **Path to Private Key file** は、関連するエージェントを含む秘密鍵の場所を指定します。
- **ジョブ・リソース・フォルダ** は、証明書を保持するジョブ・リソースが保存されるインベントリ・フォルダを指定します。フォルダ階層は、/a/b/c のようにスラッシュを使用して指定できます。存在しないフォルダは作成されます。

## 証明書に対する操作

リンクから以下の操作が可能：

- **エージェントによる証明書の使用** は、証明書を割り当てられたエージェントの *エージェント名* と URL を表示します。 
- **エージェントに証明書を割り当てる**では、証明書を割り当てるスタンドアロンエージェントとクラスタエージェントを選択できます。ユーザは、関連するエージェントが*Path to Private Key file*プロパティで指定された場所に秘密鍵ファイルを保持していることに注意する必要があります。ユーザは秘密鍵を知っているエージェントを選択できます。
- **暗号化テスト**では、暗号化のテストを行うことができます：
  - リンクをクリックすると、*secret* のような文字列を追加できる *Plain Text* 入力フィールドが開きます。
  - 入力フィールドの右側に暗号化アイコンが表示されます。アイコンをクリックすると、*暗号化結果*ラベルが表示され、関連する結果が表示されます。

## 参考文献

### コンテキストヘルプ

-[Manage Encryption Keys](/encryption-manage-keys)

###Product Knowledge Base

-[JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  -[JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  -[JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  -[JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  -[JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
-[JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)

