# プロファイル - 署名鍵管理

Profile - Signature Key Management*タブはワークフローとジョブリソースのデプロイに使用される署名証明書を保持します。

- JOC Cockpitが*低セキュリティレベル*で運用されている場合、署名証明書は*ルート*アカウントに保存され、任意のユーザーアカウントの展開操作に使用されます。
- JOC Cockpit が *medium* Security Level で運用されている場合、署名証明書はユーザーアカウントに個別に保存され、関連するユーザーアカウントの配備操作に使用されます。
- JOC Cockpit が *high* Security Level で運用されている場合、署名証明書は JOC Cockpit の外部に保存され、*Signature Key Management* タブは使用できません。

詳細は[JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management) を参照してください。

<img src="profile-signature-key-management.png" alt="Signature Key Management" width="800" height="75" />

## 署名証明書

JS7はデフォルトで署名証明書を同梱しています。利用者は証明書の有効期間を考慮する必要があります。新しい証明書は、証明書の有効期限が切れる約半年前にJS7のバージョンと一緒に出荷されます。JS7をアップデートする代わりに、[JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment) から利用可能になる新しい証明書をアップロードすることができます。

ユーザーは独自の署名証明書を作成することができます：

- プライベート認証局（CA）またはパブリックCAから。プ ラ イ ベー ト CA の使用については[JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates) を参照し て く だ さ い。
- JOC Cockpit に含まれている組み込み CA から作成できます。

プライベートCAまたはパブリックCAを使用する場合、署名証明書に署名するために使用されたルートCA証明書または中間CA証明書をコントローラとエージェントインスタンスで使用できるようにする必要があります。証明書は、ControllerとAgentの*./config/private/trusted-x509-keys*ディレクトリにあるPEM形式のファイルから利用できるようにする必要があります。

## 証明書の署名に関する操作

以下の操作が可能です：

- 有効期間の右側にあるアイコンをクリックすると、**表示**が可能です。これにより秘密鍵と署名証明書が表示されます。
- **更新]**ポップアップウィンドウが表示され、更新された秘密鍵と署名証明書を貼り付けることができます。
- **Import]**ポップアップウィンドウが表示され、秘密鍵と署名証明書をアップロードできます。
- **Generate]**ポップアップウィンドウが表示され、内蔵 CA から秘密鍵と署名証明書を生成します。
  - 利用者は、[Profile - SSL Key Management](/profile-ssl-key-management) タブに有効なルート CA 証明書または中間 CA 証明書があることを確認する必要があります。
  - 鍵を生成する際、ユーザは新しい署名証明書を作成し署名する際に内蔵CAを使用するため、*Use SSL CA* オプションを選択する必要があります。
- **Delete**は秘密鍵と署名証明書を削除します。低セキュリティレベルと中セキュリティレベルでは、ワークフローとジョブリソースがデプロイされなくなります。

## 参考文献

### コンテキストヘルプ

-[Profile](/profile)
-[Profile - SSL Key Management](/profile-ssl-key-management)

###Product Knowledge Base

-[JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates)
-[JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment)
-[JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management)

