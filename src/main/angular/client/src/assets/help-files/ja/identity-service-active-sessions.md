# Identity Service アクティブセッション

[Identity Services](/identity-services)アイデンティティサービスは、認証と承認によって JOC コックピットへのアクセスをルール化します。

ユーザは、メニューバーのホイールアイコンから *Manage Identity Services* ビューを呼び出すと、アクティブなセッションを保持しているアカウントを識別できます。

アクティブなセッションは、使用中のアカウント、ログインに使用した Identity Service、および残りのセッション時間から表示されます。

- JOC Cockpit はアカウントごとのセッション数を制限しません。
- セッションの残り時間は、以下の要因によって制限されます：
  - [Settings - Identity Service](/settings-identity-service) ページで構成される *session_idle_timeout* 設定は、ユーザーアクティビティなしでセッションがアクティブな状態を維持できる最 大時間を制限します。
  - OIDCやKeycloakなどのIDサービス・プロバイダは、ユーザ・セッションの最大継続時間を制限できます。

## アクティブなセッションに対する操作

アクティブなセッションに対する操作は以下のとおりです：

- **ブロックリストに追加**は、関連するアカウントを今後のログインを拒否する[Identity Service - Blocklist](/identity-service-blocklist) に追加します。この操作はアカウントの現在のセッションを終了させません。
- **セッションのキャンセル**は、アカウントの現在のセッションを強制的に終了します。これは、アカウントが新しいログイン操作を実行することを妨げません。
- Cancel all Sessions for Account** **Cancel Session**と同様に、指定されたアカウントのすべてのセッションを終了します。

1つ以上のセッションを選択している場合、**セッションのキャンセル*操作は、サブビューの右上隅にある関連ボタンで一括操作から利用できます。

## 参考文献

### コンテキストヘルプ

-[Identity Service - Blocklist](/identity-service-blocklist)
-[Identity Services](/identity-services)
-[Settings - Identity Service](/settings-identity-service)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

