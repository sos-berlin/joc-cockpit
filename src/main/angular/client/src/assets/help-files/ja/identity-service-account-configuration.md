# アイデンティティサービスアカウントの設定

アイデンティティサービスは、認証と承認によって JOC コックピットへのアクセスをルール化します。[Identity Services](/identity-services) を参照してください。

多くの Identity Services では、アカウントの追加、更新、削除の操作が可能です（例：[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) ）。

## アカウント構成

アカウントでは、以下のプロパティを使用できます：

- **アカウント**はログインに使用するアカウントを指定します。
- **パスワード**は*JOC* Identity Service Typeで使用できます。Password**はデータベースに保存される前にハッシュ化されます。ログイン時に同様のハッシュ処理が実行され、パスワードが比較されます。 
  - 個別の *Password* を指定できます。空のままにすると、[Settings - Identity Service](/settings-identity-service) ページで指定された *initial_password* が使用されます。Password*は、同じSettingsページの*minimum_password_length*要件と一致しなければなりません。
  - どちらのソースが*Password*に使用されても、ユーザーは次回ログイン時にアカウントの*Password*を変更する必要があります。
- **パスワードの確認**は、個別に指定された*Password*を繰り返すために使用されます。Password*プロパティが空の場合、*Confirm Password*プロパティも空でなければなりません。
- **Roles**は、アカウントに割り当てられている[Identity Service - Roles](/identity-service-roles) のリストを指定します。
- **Force Password Change** は、次回ログイン時にユーザー・アカウントがその *Password* を変更しなければならないかどうかを示します。パスワード変更は、個別に指定された*Password*と初期*Password*の継続的な使用を防ぐために強制されます。
- 既存のアカウントで使用可能なプロパティは以下のとおりです：
  - **Blocked**は、アカウントが[Identity Service - Blocklist](/identity-service-blocklist) に追加され、アクセスが拒否されることを指定します。
  - **Disabled**は、アカウントが非アクティブであり、アクセスが拒否されることを指定します。

## 参考文献

### コンテキストヘルプ

-[Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Service - Roles](/identity-service-roles) 
-[Identity Services](/identity-services)
-[Settings - Identity Service](/settings-identity-service)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

