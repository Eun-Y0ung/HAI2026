export type DomainId = 'music' | 'book' | 'movie' | 'fashion'

export type Preferences = {
  [key in DomainId]?: Record<string, string>
}

export const DOMAINS: { id: DomainId; label: string; emoji: string }[] = [
  { id: 'music',   label: '음악',      emoji: '🎵' },
  { id: 'book',    label: '책',        emoji: '📚' },
  { id: 'movie',   label: '영화',      emoji: '🎬' },
  { id: 'fashion', label: '패션 코디', emoji: '👗' },
]

export type Question = {
  key: string
  question: string
  options: string[]
}

export const QUESTIONS: Record<DomainId, Question[]> = {
  music: [
    { key: 'mood',       question: '어떤 무드의 음악을 좋아하세요?',        options: ['몽환적', '에너지틱', '잔잔한', '다크한'] },
    { key: 'listenTime', question: '주로 언제 음악을 들어요?',              options: ['출퇴근 중', '운동 중', '작업 중', '잠들기 전'] },
    { key: 'openness',   question: '새로운 음악 탐색에 얼마나 열려있나요?', options: ['완전 열려있음', '조금은', '익숙한 게 좋음'] },
  ],
  book: [
    { key: 'density', question: '어떤 밀도의 서사를 좋아하나요?', options: ['묵직하고 느린', '빠른 전개', '중간'] },
    { key: 'ending',  question: '결말 선호는?',                   options: ['열린 결말', '명확한 결말', '상관없음'] },
    { key: 'pace',    question: '책 읽는 속도는?',                options: ['천천히 음미', '빠르게 독파', '그때그때 달라'] },
  ],
  movie: [
    { key: 'genre',     question: '선호하는 장르 무드는?',          options: ['잔잔한 드라마', '스릴러', 'SF·판타지', '코미디'] },
    { key: 'runtime',   question: '선호 러닝타임은?',              options: ['90분 이하', '2시간 전후', '길어도 OK'] },
    { key: 'afterFeel', question: '영화 보고 난 뒤 감정 여운은?',  options: ['오래 남는 게 좋음', '개운하게', '상관없음'] },
  ],
  fashion: [
    { key: 'style',    question: '평소 스타일 무드는?',              options: ['미니멀', '스트릿', '빈티지', '포멀'] },
    { key: 'item',     question: '자주 입는 아이템은?',              options: ['데님', '니트', '셋업', '후드·맨투맨'] },
    { key: 'occasion', question: '주로 어떤 상황에 입을 옷을 찾나요?', options: ['데일리', '출근', '약속·데이트', '운동'] },
  ],
}

export const DOMAIN_ACCENT: Record<DomainId, string> = {
  music:   '#a8edce',
  book:    '#c4b5fd',
  movie:   '#fde68a',
  fashion: '#fca5a5',
}
