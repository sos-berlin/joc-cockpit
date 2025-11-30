# 暗号化キーの管理

[JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) は、ジョブで使用される秘密を安全に扱う方法を提供します。ユーザは非対称鍵を使ってパスワードのような機密データを暗号化・復号化することができます。

暗号化と復号化には、非対称なX.509秘密鍵と証明書が使用されます。これには以下の役割が含まれます：

- 送信者：受信者の証明書または公開鍵にアクセスし、受信者の公開鍵に基づく秘密を暗号化。
- 受信者：暗号化された秘密の復号を可能にする秘密鍵にアクセス可能。

暗号鍵の作成については、[JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys) を参照。

暗号化鍵の管理については、[JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys) を参照。

暗号化のプロセスは次のようになります：

<img src="encryption-process.png" alt="Encryption Process" width="750" height="240" />

復号化のプロセスは次のようになります：

<img src="decryption-process.png" alt="Decryption Process" width="880" height="210" />

暗号化キーの管理」ページは、証明書を管理し、証明書のプロパティを指定するために使用されます。

## 証明書一覧

既存の暗号化証明書が一覧表示されます：

- **アクションメニュー**では、証明書エントリの更新と削除ができます。
- **証明書エイリアス**は利用者が証明書に付与するユニークな名前です。
- **アイコンをクリックすると、関連する証明書が表示されます。
- **秘密鍵ファイルへのパス**は、関連するエージェントの秘密鍵の場所を指定します。

## 証明書に関する操作

画面上部から以下のボタンが利用できます：

- **証明書の追加**では、コピー/貼り付けから証明書を追加することができます。[Manage Encryption Certificate](/encryption-manage-certificate) から詳細を検索します。
- **証明書のインポート**は証明書ファイルをアップロードします。

証明書リスト**から、関連する 3 点のアクションメニューで以下の操作が可能です：

- **証明書の更新**では、証明書のエントリを変更できます。[Manage Encryption Certificate](/encryption-manage-certificate) から詳細を検索します。
- **証明書の削除**は、証明書エントリを削除します。

## 参考文献

### コンテキストヘルプ

-[Manage Encryption Certificate](/encryption-manage-certificate)

###Product Knowledge Base

-[JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  -[JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  -[JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  -[JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  -[JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
-[JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)

