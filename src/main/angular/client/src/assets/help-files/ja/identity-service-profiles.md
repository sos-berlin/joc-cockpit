# アイデンティティサービスプロファイル

アイデンティティサービスは、認証と承認によってJOCコックピットへのアクセスをルール化します。[Identity Services](/identity-services) を参照してください。

Identity Service でログインするユーザは、初回ログイン時に関連する Identity Service の *Profile* が作成されます。

- 複数の Identity Service でログインできる場合、ユーザはログインに成功した各 Identity Service で *Profile* を持つことになります。
- Profile*は、[Settings - JOC Cockpit](/settings-joc) ページの *default_profile_account* 設定で指定されたアカウントから作成されます。デフォルトでは、*root* アカウントの *Profile* が使用されます。
- 長期間使用されない場合、*Profile*は削除されます。[Settings - Cleanup Service](/settings-cleanup) ページでは、関連するユーザ・アカウントからログインが発生しない場合に *Profile* が保持される最大期間を指定します。

## プロファイルに対する操作

サブビューには有効な*プロファイル*のリストと最終ログイン日が表示されます。プロファイル*に対して個別に以下の操作が可能です：

- プロファイル*をクリックすると、[Identity Service - Roles](/identity-service-roles) のサブビューに移動し、指定された*プロファイル*で使用されているロールが表示されます。
- Profile*のアクションメニューには以下の操作があります：
  - **Delete Profile Preferences** は[Profile - Preferences](/profile-preferences) をデフォルトにリセットします。Git Management* や *Favorite Management* などの他の *Profile* 設定はそのまま残ります。この操作は、デフォルトアカウントの *Profile* の適用を強制するために使用できます。
  - **プロファイルの削除**は、ユーザーアカウントの*プロファイル*を消去します。関連アカウントの次回ログイン時に、新しい*Profile*が作成されます。

ユーザーは 1 つ以上の *Profile* を選択して、選択した *Profile* に対して上記の操作を一括して実行できます。

## 参考文献

### コンテキストヘルプ

-[Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Accounts](/identity-service-accounts) 
- [Identity Service - Roles](/identity-service-roles) 
-[Identity Services](/identity-services)
- [Profile - Preferences](/profile-preferences) 
-[Settings - Cleanup Service](/settings-cleanup)
-[Settings - JOC Cockpit](/settings-joc)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

