# プロファイル

*プロファイル* は、JOCコックピットのユーザー環境の設定をします。

*ベースプロファイル* は、通常、使用する *root* アカウントから使用できます。

- 初回ログイン時にユーザーアカウントの *プロファイル* を生成します。
- JOCコックピットが *low* セキュリティレベルで運用されている場合、すべてのユーザーアカウントに関連する設定を提供します。

ユーザーは[設定 - JOC](/settings-joc) ページから、*プロファイル* を別のアカウントに切り替えることができます。

アクティブでないプロファイルは、[クリーンアップサービス](/service-cleanup) によって自動削除されます。

*プロファイル* では、現在のユーザーに適用される設定とプリファレンスを管理できます。

詳細については、[JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles) を参照してください。

## パスワードの変更

*パスワード変更* リンクをクリックすると、現在のログインに使用された *JOC* タイプの[Identity Services](/identity-services)の場合、ユーザーはパスワードを変更することができます。

- **今のパスワード**では現在使用されているパスワードを入力します。
- **新しいパスワード**は、新しいパスワードを入力します。
    - パスワード長の最小値は、[設定 - Identity Service](/settings-identity-service) で設定できます。
    - *今のパスワード* と *新しいパスワード* は異なる必要があります。

## プロファイル設定

*プロファイル* の設定は、以下の項目から利用できます：

- [プロファイル - 設定値](/profile-preferences)
- [プロファイル - パーミッション](/profile-permissions)
- [プロファイル - 鍵管理](/profile-signature-key-management)
- [プロファイル - CA管理](/profile-ssl-key-management)
- [プロファイル - Git管理](/profile-git-management)
- [プロファイル - お気に入り管理](/profile-favorite-management)

## 参照

### コンテキストヘルプ

- [Cleanup Service](/service-cleanup)
- [Identity Services](/identity-services)
- [Settings - JOC Cockpit](/settings-joc)
- [Settings - Identity Service](/settings-identity-service)

###Product Knowledge Base

- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)

