import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'zh-Hant' | 'zh-Hans'

const STORAGE_KEY = 'azalea-lang'

type Dict = Record<string, string>

const en: Dict = {
  'nav.mission': 'Our mission',
  'nav.send': 'Send a Picture!',
  'nav.draw': 'Draw',
  'nav.thank': 'Thank',
  'nav.view': 'View',
  'nav.current': 'Current Mission',
  'nav.donate': 'Donate to the Cause',
  'nav.updates': 'Updates',
  'nav.volunteer': 'Volunteer',
  'nav.track': 'Track',
  'nav.staff': 'Staff',
  'lang.label': 'Language',
  'lang.en': 'EN',
  'lang.zhHant': '繁',
  'lang.zhHans': '简',
  'hero.eyebrow': 'Kindness across the Globe',
  'hero.title': 'Every person<br />deserves to feel<br /><em>seen.</em>',
  'hero.body': 'We’re a student-led community connecting Bay Area neighbors with people with disabilities and their caregivers in Taiwan—one drawing, message, and shared moment at a time.',
  'hero.ctaDraw': 'Create a drawing',
  'hero.ctaMission': 'Our mission',
  'sender.anonymous': 'A Bay Area community member',
  'track.title': 'Track your kindness',
  'track.body': 'Enter the tracking code from your confirmation to see anonymized progress: received → reviewed → translated → delivered.',
  'track.code': 'Tracking code',
  'track.lookup': 'Look up',
  'track.notFound': 'No submission found for that code in this browser’s prototype store.',
  'track.stage.received': 'Received',
  'track.stage.needs_guardian': 'Waiting on guardian',
  'track.stage.in_review': 'In review',
  'track.stage.rejected': 'Needs changes',
  'track.stage.reviewed': 'Reviewed',
  'track.stage.translated': 'Translated',
  'track.stage.delivered': 'Delivered to facility',
  'track.stage.acknowledged': 'Seen by caretakers',
  'track.replies': 'Replies from caretakers',
  'track.noNote': 'No note included.',
  'track.createAnother': 'Create another',
  'staff.inbox.title': 'Facility inbox',
  'staff.inbox.body': 'Drawings ready for your facility. Mark as seen when you’ve shared them—they leave this inbox and stay in Gallery.',
  'staff.inbox.empty': 'Inbox clear. Newly delivered drawings will appear here.',
  'staff.inbox.waiting': 'Awaiting your acknowledgment',
  'staff.inbox.seen': 'Seen by your team',
  'staff.inbox.acknowledge': 'Mark as seen',
  'staff.inbox.replyTitle': 'Reply to sender',
  'staff.inbox.replyText': 'Message',
  'staff.inbox.replyImage': 'Picture reply (optional)',
  'staff.inbox.postReply': 'Post reply',
  'staff.tagId': 'Tag ID',
  'staff.tab.workspace': 'Workspace',
  'staff.tab.gallery': 'Gallery',
  'staff.gallery.eyebrow': 'For partner staff',
  'staff.gallery.title': 'Art that belongs<br /><em>to everyone.</em>',
  'staff.gallery.body': 'A quiet place to browse every drawing shared with your team—same spirit as the community garden, ready to become its own page later.',
  'staff.gallery.empty': 'The garden is still waiting. When drawings arrive, they will bloom here.',
  'staff.gallery.caption': 'Art that belongs to everyone.',
}

const zhHant: Dict = {
  ...en,
  'nav.mission': '我們的使命',
  'nav.send': '傳送心意！',
  'nav.draw': '畫畫',
  'nav.thank': '感謝',
  'nav.view': '瀏覽',
  'nav.current': '目前任務',
  'nav.donate': '捐款支持',
  'nav.updates': '最新消息',
  'nav.volunteer': '志工',
  'nav.track': '追蹤',
  'nav.staff': '工作人員',
  'lang.label': '語言',
  'hero.eyebrow': '把善意送到世界各地',
  'hero.title': '每個人都值得被看見。',
  'hero.body': '我們是學生主導的社群，連結灣區鄰居與台灣身心障礙朋友及其照顧者——透過畫作、訊息與彼此陪伴。',
  'hero.ctaDraw': '開始畫畫',
  'hero.ctaMission': '了解使命',
  'sender.anonymous': '一位灣區社群成員',
  'track.title': '追蹤你的善意',
  'track.body': '輸入確認頁上的追蹤代碼，查看進度：已收到 → 已審核 → 已翻譯 → 已送達。',
  'track.code': '追蹤代碼',
  'track.lookup': '查詢',
  'track.notFound': '在此瀏覽器的原型資料中找不到該代碼。',
  'track.stage.received': '已收到',
  'track.stage.needs_guardian': '等待監護人',
  'track.stage.in_review': '審核中',
  'track.stage.rejected': '需要修改',
  'track.stage.reviewed': '已審核',
  'track.stage.translated': '已翻譯',
  'track.stage.delivered': '已送達機構',
  'track.stage.acknowledged': '照顧者已查看',
  'track.replies': '照顧者回覆',
  'track.noNote': '沒有附加留言。',
  'track.createAnother': '再畫一幅',
  'staff.inbox.title': '機構收件匣',
  'staff.inbox.body': '已送達貴機構的畫作。標記為已查看後會離開收件匣，仍可在畫廊瀏覽。',
  'staff.inbox.empty': '收件匣已清空。新送達的畫作會顯示在這裡。',
  'staff.inbox.waiting': '待您確認已查看',
  'staff.inbox.seen': '貴團隊已查看',
  'staff.inbox.acknowledge': '標記為已查看',
  'staff.inbox.replyTitle': '回覆寄件者',
  'staff.inbox.replyText': '訊息',
  'staff.inbox.replyImage': '圖片回覆（選填）',
  'staff.inbox.postReply': '送出回覆',
  'staff.tagId': '追蹤編號',
  'staff.tab.workspace': '工作區',
  'staff.tab.gallery': '畫廊',
  'staff.gallery.eyebrow': '給合作夥伴',
  'staff.gallery.title': '屬於大家的<br /><em>藝術。</em>',
  'staff.gallery.body': '靜靜瀏覽團隊收到的每一幅畫——與社群花園同樣的心意，之後可獨立成頁。',
  'staff.gallery.empty': '花園還在等待。畫作送達後會在這裡綻放。',
  'staff.gallery.caption': '屬於大家的藝術。',
}

const zhHans: Dict = {
  ...zhHant,
  'nav.mission': '我们的使命',
  'nav.send': '传送心意！',
  'nav.draw': '画画',
  'nav.thank': '感谢',
  'nav.view': '浏览',
  'nav.current': '当前任务',
  'nav.donate': '捐款支持',
  'nav.updates': '最新消息',
  'nav.volunteer': '志愿者',
  'nav.track': '追踪',
  'nav.staff': '工作人员',
  'lang.label': '语言',
  'hero.eyebrow': '把善意送到世界各地',
  'hero.title': '每个人都值得被看见。',
  'hero.body': '我们是学生主导的社区，连接湾区邻居与台湾身心障碍朋友及其照顾者——透过画作、讯息与彼此陪伴。',
  'hero.ctaDraw': '开始画画',
  'hero.ctaMission': '了解使命',
  'sender.anonymous': '一位湾区社区成员',
  'track.title': '追踪你的善意',
  'track.body': '输入确认页上的追踪代码，查看进度：已收到 → 已审核 → 已翻译 → 已送达。',
  'track.code': '追踪代码',
  'track.lookup': '查询',
  'track.notFound': '在此浏览器的原型数据中找不到该代码。',
  'track.stage.received': '已收到',
  'track.stage.needs_guardian': '等待监护人',
  'track.stage.in_review': '审核中',
  'track.stage.rejected': '需要修改',
  'track.stage.reviewed': '已审核',
  'track.stage.translated': '已翻译',
  'track.stage.delivered': '已送达机构',
  'track.stage.acknowledged': '照顾者已查看',
  'track.replies': '照顾者回复',
  'track.noNote': '没有附加留言。',
  'track.createAnother': '再画一幅',
  'staff.inbox.title': '机构收件箱',
  'staff.inbox.body': '已送达贵机构的画作。标记为已查看后会离开收件箱，仍可在画廊浏览。',
  'staff.inbox.empty': '收件箱已清空。新送达的画作会显示在这里。',
  'staff.inbox.waiting': '待您确认已查看',
  'staff.inbox.seen': '贵团队已查看',
  'staff.inbox.acknowledge': '标记为已查看',
  'staff.inbox.replyTitle': '回复寄件者',
  'staff.inbox.replyText': '讯息',
  'staff.inbox.replyImage': '图片回复（选填）',
  'staff.inbox.postReply': '送出回复',
  'staff.tagId': '追踪编号',
  'staff.tab.workspace': '工作区',
  'staff.tab.gallery': '画廊',
  'staff.gallery.eyebrow': '给合作伙伴',
  'staff.gallery.title': '属于大家的<br /><em>艺术。</em>',
  'staff.gallery.body': '静静浏览团队收到的每一幅画——与社区花园同样的心意，之后可独立成页。',
  'staff.gallery.empty': '花园还在等待。画作送达后会在这里绽放。',
  'staff.gallery.caption': '属于大家的艺术。',
}

const TABLES: Record<Lang, Dict> = {
  en,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
}

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh-Hant' || stored === 'zh-Hans') return stored
  } catch {
    /* ignore */
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'zh-Hant' ? 'zh-Hant' : 'zh-Hans'
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => ({
    lang,
    setLang,
    t: (key: string) => TABLES[lang][key] ?? TABLES.en[key] ?? key,
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    return {
      lang: 'en' as Lang,
      setLang: () => undefined,
      t: (key: string) => TABLES.en[key] ?? key,
    }
  }
  return ctx
}

export function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage()
  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>{t('lang.en')}</button>
      <button type="button" className={lang === 'zh-Hant' ? 'active' : ''} onClick={() => setLang('zh-Hant')}>{t('lang.zhHant')}</button>
      <button type="button" className={lang === 'zh-Hans' ? 'active' : ''} onClick={() => setLang('zh-Hans')}>{t('lang.zhHans')}</button>
    </div>
  )
}
