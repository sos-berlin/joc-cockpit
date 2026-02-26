# IDサービス管理 - アカウント構成

IDサービスは、認証と認可によってJOCコックピットへのアクセスを管理します。[IDサービス管理](/identity-services) を参照してください。

IDサービス管理では、アカウントの追加、更新、削除の操作が可能です（例：[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) ）。

## アカウント構成

アカウントでは、以下の項目を設定します：

- **アカウント** は、ログインに使用するアカウント名を指定します。
- **パスワード** は、*JOC* IDサービスタイプで使用します。パスワードはデータベースに保存される前にハッシュ化され、ログイン時に同様のハッシュ処理が実行され、パスワードが比較されます。 
  - 個別の *パスワード* を指定できます。空のままにすると、[設定 - Identity Service](/settings-identity-service) 画面で設定された *initial_password* が使用されます。パスワードは、同じ設定画面の *minimum_password_length* 要件と一致しなければなりません。
  - どちらのソースが *パスワード* に使用されても、ユーザーは次回ログイン時にアカウントの *パスワード* を変更する必要があります。
- **確認用パスワード** は、設定した *パスワード* を繰り返し入力します。*パスワード* が空の場合、*確認用パスワード* も空でなければなりません。
- **ロール** は、アカウントに割り当てられている[IDサービス管理 - ロール管理](/identity-service-roles) のリストを指定します。
- **パスワード変更を強制** は、次回ログイン時にユーザーアカウントがその *パスワード* を変更しなければならないかどうかを示します。パスワード変更は、個別に指定された *パスワード* と初期 *パスワード* の継続的な使用を防ぐために強制されます。
- 既存のアカウントで使用可能なプロパティは以下のとおりです：
  - **ブロック中** は、アカウントが[IDサービス管理 - ブロックリスト](/identity-service-blocklist) に追加され、アクセスが拒否されることを指定します。
  - **無効** は、アカウントが無効であり、アクセスが拒否されることを指定します。

## 参照

### コンテキストヘルプ

- [IDサービス管理 - ブロックリスト](/identity-service-blocklist)
- [IDサービス管理 - ロール管理](/identity-service-roles) 
- [IDサービス管理](/identity-services)
- [設定 - Identity Service](/settings-identity-service)

###Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

