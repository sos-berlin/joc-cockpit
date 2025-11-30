# プロフィール

プロファイル*は、JOCコックピットとのインタラクションに関連する設定を保持します。

ベース・プロファイル*は、通常、使用する*ルート*アカウントから使用できます。

- 初回ログイン時にユーザー・アカウントの *ユーザー・プロファイル* を入力するため、
- JOC Cockpitが*低い*セキュリティレベルで運用されている場合、すべてのユーザーアカウントに関連する設定を提供します。

ユーザーは[Settings - JOC Cockpit](/settings-joc) ページから、*Base Profile* を別のアカウントに切り替えることができます。

アクティブでないプロファイルは、[Cleanup Service](/service-cleanup) によってパージされることに注意してください。

ユーザープロファイル*では、現在のユーザーに適用される設定とプリファレンスを管理できます。

詳細については、[JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles) を参照してください。

## パスワードの変更

関連リンクをクリックすると、アクティブな[Identity Services](/identity-services) 、現在のログインに使用された *JOC*タイプのサービスが含まれている場合、ユーザーはパスワードを変更することができます。

- **旧パスワード**では現在使用されているパスワードが指定されます。
- **新しいパスワード**は、新しいパスワードが指定されることを期待します。
    - パスワードの長さの最小値は、[Settings - Identity Service](/settings-identity-service) で構成されるように要求されます。
    - Old Password* と *New Password* は異なる必要があります。

## プロファイルセクション

ユーザープロファイル*の設定は、以下のセクションから利用できます：

-[Profile - Preferences](/profile-preferences)
-[Profile - Permissions](/profile-permissions)
-[Profile - Signature Key Management](/profile-signature-key-management)
-[Profile - SSL Key Management](/profile-ssl-key-management)
-[Profile - Git Management](/profile-git-management)
-[Profile - Favorite Management](/profile-favorite-management)

## 参考文献

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Identity Services](/identity-services)
-[Settings - JOC Cockpit](/settings-joc)
-[Settings - Identity Service](/settings-identity-service)

###Product Knowledge Base

-[JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)

