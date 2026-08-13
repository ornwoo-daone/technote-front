// 검색창 placeholder 타이핑 애니메이션의 «상태 전이» 부분.
// 타이머와 분리해 둔 이유는 이것만 따로 검사할 수 있게 하려는 것 —
// setTimeout 안에 섞어두면 한 글자씩 늘고 주는 규칙이 맞는지 확인할 방법이 없다.
//
// 타이밍·커서 문자는 레거시 dbpage.js 의 tw() 를 그대로 옮겼다(95/1200/45/420ms, '┃').

export const CURSOR = '┃';

export interface TypeState {
  /** 지금 치고 있는 예시 문구의 인덱스 */
  readonly word: number;
  /** 지금까지 드러난 글자 수 */
  readonly chars: number;
  /** 지우는 중 */
  readonly deleting: boolean;
}

export const START: TypeState = { word: 0, chars: 0, deleting: false };

export interface TypeStep {
  readonly text: string;
  /** 다음 단계까지 기다릴 시간(ms) */
  readonly delay: number;
  readonly next: TypeState;
}

export function step(s: TypeState, words: readonly string[]): TypeStep {
  const word = words[s.word % words.length] ?? '';

  if (!s.deleting) {
    const chars = s.chars + 1;
    const text = word.slice(0, chars) + CURSOR;
    // 다 쳤으면 잠깐 멈춘 뒤 지우기 시작한다
    return chars >= word.length
      ? { text, delay: 1200, next: { ...s, chars, deleting: true } }
      : { text, delay: 95, next: { ...s, chars } };
  }

  const chars = s.chars - 1;
  const text = word.slice(0, Math.max(0, chars)) + CURSOR;
  return chars <= 0
    ? { text, delay: 420, next: { word: (s.word + 1) % words.length, chars: 0, deleting: false } }
    : { text, delay: 45, next: { ...s, chars } };
}
