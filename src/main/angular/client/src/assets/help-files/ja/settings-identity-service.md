# 設定 - アイデンティティサービス

以下の設定は、すべての[Identity Services](/identity-services) に適用されます。変更は直ちに有効になります。

設定」ページには、メニューバーの ![wheel icon](assets/images/wheel.png) アイコンからアクセスできます。

## アイデンティティサービス設定

### 設定 *idle_session_timeout*, Default： *30*m

JOC Cockpitのアイドル・セッションの最大継続時間を分単位で指定します。

- 指定された分数の間ユーザがアクティブでない場合、ユーザ・セッションは失効して終了します。ユーザーは資格情報を指定してログインし、新しいユーザーセッションを作成できます。
- 外部のIdentity Serviceから提供されたアクセストークンの有効期限が最大アイドルタイムアウトと異なる場合、JOC CockpitはIdentity Serviceとアクセストークンの更新を試みます。アクセストークンの更新では、ユーザはログイン認証情報を再入力する必要はありません。
- アイデンティティサービスは、アクセストークンの有効期間（有効期間）を制限したり、アクセストークンの更新を制限したりできます（最大有効期間）。アクセストークンを更新できない場合、ユーザーセッションは終了し、ユーザーはログインを実行する必要があります。

### 設定 *initial_password*, Default： *初期値

新しいアカウントを作成するとき、または[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) でパスワードをリセットするときに使用される初期パスワードを指定します。

- 管理者がJOC Cockpitでユーザーアカウントを追加し、パスワードを指定しない場合、初期パスワードが使用されます。原則として、JOC Cockpitは空のパスワードの使用を許可せず、*initial_password*から入力します。管理者は初期パスワードを適用することができ、指定されたアカウントの個別のパスワードを指定することができます。
- ユーザ・アカウントのパスワードをリセットする場合、既存のパスワードは *initial_password* に置き換えられます。
- ユーザ・アカウントに*initial_password*または個別のパスワードが割り当てられている場合 とは別に、パスワードは初回ログイン時にユーザによって変更されなければなりません。これにより、ユーザは初回ログイン時以外には初期パスワードを使用できなくなります。

### 設定 *設定：minimum_password_length*、デフォルト： *1*

JOC Identity Serviceのパスワードの最小長を指定します。

指定されたすべてのパスワード（*initial_password* を含む）について、最小の長さが示されます。
文字数と文字選択の任意性は、安全なパスワードの重要な要素であることに注意。使用する数字や特殊文字などを必要とするパスワードの複雑さは、短いパスワードの場合を除 き、パスワードのセキュリティを実質的に高めるものではありません。

## 参考文献

### コンテキストヘルプ

-[Identity Services](/identity-services)
-[Settings](/settings)

###Product Knowledge Base

-[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
-[JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
-[JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

