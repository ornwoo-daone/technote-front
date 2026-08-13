import { docKey, docStamp, docTouched } from '../../entities/docs/registry';
import type { Doc } from '../../entities/docs/registry';

// «지난 방문 이후 새로 올라오거나 고쳐진 덱» 을 고른다.
//
// 예전 구현은 두 가지를 놓쳤다.
//  ① 마지막 방문을 «날짜» 로만 기록하고 `at > seen` 으로 비교했다. 방문한 날 올라온 덱은
//     `at === seen` 이라 영원히 감지되지 않았다 — 같은 날 추가는 전부 조용히 묻혔다.
//  ② 수정(`up`)을 아예 보지 않았다. 덱 내용을 고쳐도 알림이 안 떴다.
// 그래서 기준을 «분 단위 시각» 으로 바꾸고, 생성뿐 아니라 마지막으로 움직인 시각을 본다.

export interface Fresh {
  readonly doc: Doc;
  /** 이번에 감지된 시각 (생성 또는 수정) */
  readonly stamp: string;
  /** 새로 올라온 게 아니라 «고쳐진» 것 */
  readonly updated: boolean;
}

/** 이미 알린 항목을 기억하는 키. 같은 덱이라도 «수정될 때마다» 다시 알려야 해서 시각을 붙인다. */
export const notifyKey = (f: Fresh): string => `${docKey(f.doc)}@${f.stamp}`;

export function freshDocs(
  docs: readonly Doc[],
  /** 마지막 방문 시각 'YYYY-MM-DD HH:mm' */
  seen: string,
  /** 이미 알린 notifyKey 목록 */
  notified: readonly string[],
): readonly Fresh[] {
  return docs
    .map((doc) => ({ doc, stamp: docTouched(doc), updated: docStamp(doc) <= seen }))
    .filter((f) => f.stamp > seen && !notified.includes(notifyKey(f)))
    .sort((a, b) => (a.stamp < b.stamp ? 1 : a.stamp > b.stamp ? -1 : 0));
}
