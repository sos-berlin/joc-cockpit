# プロファイル - 鍵管理

*プロファイル - 鍵管理* タブはワークフローとジョブリソースの配置に使用される署名証明書を保持します。

- JOCコックピットが *low* セキュリティレベルで運用されている場合、署名証明書は *root* アカウントに保存され、任意のユーザーアカウントの配置に使用されます。
- JOCコックピットが *medium* セキュリティレベルで運用されている場合、署名証明書はユーザーアカウントに個別に保存され、関連するユーザーアカウントの配置に使用されます。
- JOCコックピットが *high* セキュリティレベルで運用されている場合、署名証明書はJOCコックピットの外部に保存され、*鍵管理* タブは使用できません。

詳細は[JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management) を参照してください。

<img src="profile-signature-key-management.png" alt="Signature Key Management" width="800" height="75" />

## 署名証明書

JS7はデフォルトで署名証明書を同梱しています。利用者は証明書の有効期間を考慮する必要があります。新しい証明書は、証明書の有効期限が切れる約半年前にJS7のバージョンと一緒に出荷されます。JS7をバージョンアップする代わりに、[JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment) から利用可能になる新しい証明書をアップロードすることができます。

ユーザーは独自の署名証明書を作成することもできます：

- プライベート認証局（CA）またはパブリックCAから作成。プライベートCAの使用については[JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates) を参照し て く だ さ い。
- JOCコックピットに含まれている内蔵CAから作成できます。

プライベートCAまたはパブリックCAを使用する場合、署名証明書に署名するために使用されたルートCA証明書または中間CA証明書をコントローラとエージェントインスタンスで使用できるようにする必要があります。証明書は、コントローラーとエージェントの *./config/private/trusted-x509-keys* ディレクトリにあるPEM形式のファイルから利用できるようにする必要があります。

## 証明書の署名の操作

以下の操作が可能です：

- 有効期間の右側にあるアイコンをクリックすると、秘密鍵と署名証明書が表示されます。
- **鍵更新**をクリックすると、ポップアップウィンドウが表示され、更新された秘密鍵と署名証明書を貼り付けることができます。
- **インポート**をクリックすると、ポップアップウィンドウが表示され、秘密鍵と署名証明書をアップロードできます。
- **鍵生成**をクリックすると、ポップアップウィンドウが表示され、内蔵CAから秘密鍵と署名証明書を生成します。
  - 利用者は、[プロファイル - CA管理](/profile-ssl-key-management) タブに有効なルートCA証明書または中間CA証明書があることを確認する必要があります。
  - 鍵を生成する際、ユーザは新しい署名証明書を作成し署名する際に内蔵CAを使用するため、*SSL CAを鍵署名に使用* オプションを選択する必要があります。
- **削除**は秘密鍵と署名証明書を削除します。*low* セキュリティレベルと *medium* セキュリティレベルでは、ワークフローとジョブリソースが配置できなくなります。

## 参照

### コンテキストヘルプ

- [プロファイル](/profile)
- [プロファイル - CA管理](/profile-ssl-key-management)

###Product Knowledge Base

- [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates)
- [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment)
- [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management)

