// 알림 목록의 «N분 전» 표기.
//
// 저장된 시각이 HH:mm 이라 초 단위는 알 수 없다 → 1분 미만은 전부 «방금».
// 시각을 모르는 문서(time 생략)는 그날 00:00 로 계산되므로 하루 안에서 최대 24시간 밀린다.

// 시·분 범위를 정규식에서 막는다. \d{2} 로 두면 25:99 가 통과해 Date 가 다음 날로 넘어간다.
const RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?: ([01]\d|2[0-3]):([0-5]\d))?$/;

/** 'YYYY-MM-DD HH:mm' → 로컬 시각. Date.parse 는 날짜만 있으면 UTC 로 읽어 KST 와 9시간 어긋난다. */
export function parseStamp(stamp: string): Date | null {
  const m = RE.exec(stamp);
  if (!m) return null;
  const n = (i: number): number => Number(m[i] ?? '0');
  return new Date(n(1), n(2) - 1, n(3), n(4), n(5));
}

/** Date → 'YYYY-MM-DD HH:mm'(로컬). toISOString 은 UTC 라 KST 에서 하루가 밀린다. */
export function formatStamp(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function timeAgo(stamp: string, now: Date = new Date()): string {
  const t = parseStamp(stamp);
  if (!t) return stamp; // 형식이 깨졌으면 원본을 그대로 — 조용히 «방금» 이 되면 더 헷갈린다
  const min = Math.floor((now.getTime() - t.getTime()) / 60000);
  if (min < 1) return '방금'; // 음수(시계 오차·미래 날짜)도 여기로
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  return stamp.slice(0, 10); // 일주일 넘으면 «12일 전» 보다 날짜가 읽기 쉽다
}
