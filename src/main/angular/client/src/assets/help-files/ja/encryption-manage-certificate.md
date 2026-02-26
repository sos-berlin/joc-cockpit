# 暗号化証明書追加

[JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) は、ジョブで使用されるシークレットを安全に扱う方法を提供します。ユーザは非対称鍵を使ってパスワードのような機密データを暗号化・復号化することができます。

詳細は[暗号化鍵管理](/encryption-manage-keys) を参照してください。

*暗号化証明書追加* 画面は、証明書のプロパティを設定するために使用されます。

## 証明書

証明書には以下のプロパティがあります：

- **証明書エイリアス** は、ユーザーが証明書につけるユニークな名前です。ユーザーは自由に名前を決めることができます。証明書とプロパティは、指定された名前を使用してジョブ・リソースに保存されます。
- **証明書**では、PEM形式の証明書をコピー/ペーストすることができます。証明書は以下のようになります：

<pre>
---BEGIN CERTIFICATE---
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
---END CERTIFICATE---
</pre>

- **秘密鍵パス** は、エージェントの秘密鍵の場所を指定します。
- **ジョブリソースフォルダー** は、証明書を保持するジョブリソースが保存されるインベントリーフォルダーを指定します。フォルダー階層は、/a/b/c のようにスラッシュを使用して指定できます。存在しないフォルダは作成されます。

## 証明書に対する操作

リンクから以下の操作が可能：

- **エージェントの証明書使用状況** は、証明書を割り当てられたエージェントの *エージェント名* と URL を表示します。 
- **エージェントに証明書を割り当て** は、証明書を割り当てるスタンドアロンエージェントとクラスタエージェントを選択できます。ユーザーは、エージェントが *秘密鍵パス* で指定された場所に秘密鍵ファイルを保持していることに注意する必要があります。ユーザーは秘密鍵を知っているエージェントを選択できます。
- **暗号化テスト**では、暗号化のテストを行うことができます：
  - リンクをクリックすると、*secret* のような文字列を追加できる *Plain Text* 入力フィールドが開きます。
  - 入力フィールドの右側に暗号化アイコンが表示されます。アイコンをクリックすると、*暗号化結果*ラベルが表示され、関連する結果が表示されます。

## 参照

### コンテキストヘルプ

- [暗号化鍵管理](/encryption-manage-keys)

###Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)

