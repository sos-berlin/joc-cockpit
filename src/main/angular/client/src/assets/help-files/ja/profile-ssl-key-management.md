# プロファイル - CA管理

*プロファイル - CA管理* タブでは、JS7製品へのTLS/SSL接続のためのサーバ認証証明書とクライアント認証証明書を作成するための認証局(CA)を提供します。

詳細は[JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management) をご参照ください。

<img src="profile-ssl-key-management.png" alt="SSL Key Management" width="800" height="75" />

## SSL CA証明書

JS7はデフォルトのSSL CA証明書を同梱しています。利用者は証明書の有効期間を考慮する必要があります。新しい証明書は、証明書の有効期限が切れる約6ヶ月前にJS7のバージョンと一緒に出荷されます。JS7をアップデートする代わりに、新しい証明書をアップロードすることもできます。

ユーザーは独自のSSL CA証明書を作成することもできます：

- プライベート認証局(Private CA)またはパブリック認証局(Public CA)から。プライベート CA の使用については[JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates) を参照してください。
- JOCコックピットに組み込まれているSSL CAから作成できます。

## SSL CA証明書の操作

以下の操作が可能です：

- 有効期間の右側のアイコンをクリックすると、秘密鍵とSSL CA証明書が表示されます。
- **鍵更新** をクリックすると、ポップアップウィンドウが表示され、更新された秘密鍵と SSL CA 証明書を貼り付けることができます。
- **インポート** をクリックすると、ポップアップウィンドウが表示され、プライベートキーと SSL CA 証明書をアップロードできます。
- **生成** をクリックすると、ポップアップ・ウィンドウが表示され、秘密鍵と SSL CA 証明書が生成されます。

## 参照

### コンテキストヘルプ

- [プロファイル](/profile)
- [プロファイル - CA管理](/profile-ssl-key-management)

###Product Knowledge Base

- [JS7 - Certificate Authority](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority)
  - [JS7 - Certificate Authority - Manage Certificates with JOC Cockpit](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Manage+Certificates+with+JOC+Cockpit)
  - [JS7 - Certificate Authority - Rollout Certificates for HTTPS Connections](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Rollout+Certificates+for+HTTPS+Connections)
- [JS7 -  How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates)
- [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management)

