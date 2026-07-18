/**
 * プロフィール登録直後に選挙フローへ直行させるためのハンドオフフラグ。
 * setProfileによるStack.Protectedガード反転でホームが必ず先にマウントされるため、
 * ホーム側のeffectでこのフラグを消費して遷移する（永続化しない・再起動で消えてよい）。
 */
let pending = false;

export function markElectionHandoff() {
  pending = true;
}

export function consumeElectionHandoff(): boolean {
  const value = pending;
  pending = false;
  return value;
}
