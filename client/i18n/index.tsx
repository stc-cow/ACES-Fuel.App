import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "en" | "ar" | "ur";

type Dict = Record<string, string>;

type I18nContextType = {
  lang: Lang;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
};

const en: Dict = {
  dashboard: "Dashboard",
  usersAuth: "Users & Auth",
  missions: "Missions",
  employees: "Employees",
  drivers: "Drivers",
  technicians: "Technicians",
  sites: "Sites",
  generators: "Generators",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
  settingsGeneral: "General Settings",
  settingsCities: "Cities",
  settingsZones: "Zones",
  settingsAdminLog: "Admin Log",
  adminUsers: "Admin Users",
  authorizations: "Authorizations",
  generalSettings: "General Settings",
  literPrice: "Liter price",
  maxDistance: "Maximum distance from station to confirm task",
  language: "Language",
  save: "Save",
  saving: "Saving...",
  signInTitle: "Sign in to Super Admin",
  signInSubtitle: "Enter your details to sign in to your account",
  username: "Username",
  password: "Password",
  rememberMe: "Remember me",
  forgotPassword: "Forgot password?",
  login: "Login",
  signingIn: "Signing in…",
  searchPlaceholder: "Search…",
  signedInAs: "Signed in as",
  logout: "Logout",
  resetPassword: "Reset password",
  enterEmailToReset: "Enter your email to receive a reset link",
  sendResetLink: "Send reset link",
  cancel: "Cancel",
  resetEmailSent: "If an account exists, a reset email has been sent.",
  invalidEmail: "Please enter a valid email.",
  totalLitersToday: "Total Liters Added Today",
  totalLiters30: "Total Liters Added in Last 30 Days",
  stcCow30: "Stc-cow – Last 30 Days",
  totalTasksStatusCount: "Total tasks status count",
  totalTasksZonesCount: "Total tasks zones count",
  noDataYet: "No data yet",
  manageAdminsIntro:
    "Manage who can log in to Administrative and Authorizations",
  export: "Export",
  columns: "Columns",
  add: "Add",
  excelPrintColumnVisibility: "Excel | Print | Column visibility",
  search: "Search",
  email: "Email",
  webAuthorization: "Web Authorization",
  settingsCol: "Settings",
  noResults: "No results",
  showing: "Showing",
  of: "of",
  entries: "entries",
  prev: "Prev",
  next: "Next",
};

const ar: Dict = {
  dashboard: "لوحة التحكم",
  usersAuth: "المستخدمون والصلاحيات",
  missions: "المهام",
  employees: "الموظفون",
  drivers: "السائقون",
  technicians: "الفنيون",
  sites: "المواقع",
  generators: "المولدات",
  reports: "التقارير",
  notifications: "الإشعارات",
  settings: "الإعدادات",
  settingsGeneral: "الإعدادات العامة",
  settingsCities: "المدن",
  settingsZones: "المناطق",
  settingsAdminLog: "سجل المشرف",
  adminUsers: "مستخدمو المشرف",
  authorizations: "الصلاحيات",
  generalSettings: "الإعدادات العامة",
  literPrice: "سعر اللتر",
  maxDistance: "أقصى مسافة من المحطة لتأكيد المهمة",
  language: "اللغة",
  save: "حفظ",
  saving: "جارٍ الحفظ...",
  signInTitle: "تسجيل الدخول إلى المشرف العام",
  signInSubtitle: "أدخل بياناتك لتسجيل الدخول إلى حسابك",
  username: "اسم المستخدم",
  password: "كلمة المرور",
  rememberMe: "تذكرني",
  forgotPassword: "نسيت كلمة المرور؟",
  login: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول...",
  searchPlaceholder: "ابحث…",
  signedInAs: "مسجل الدخول باسم",
  logout: "تسجيل الخروج",
  resetPassword: "إعادة تعيين كلمة المرور",
  enterEmailToReset: "أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين",
  sendResetLink: "إرسال رابط إعادة التعيين",
  cancel: "إلغاء",
  resetEmailSent: "إذا كان الحساب موجودًا، فقد تم إرسال رسالة إعادة التعيين.",
  invalidEmail: "يرجى إدخال بريد إلكتروني صالح.",
  totalLitersToday: "إجمالي اللترات المضافة اليوم",
  totalLiters30: "إجمالي اللترات المضافة خلال آخر 30 يومًا",
  stcCow30: "Stc-cow – آخر 30 يومًا",
  totalTasksStatusCount: "إجمالي عدد حالات المهام",
  totalTasksZonesCount: "إجمالي عدد المناطق للمهام",
  noDataYet: "لا توجد بيانات بعد",
  manageAdminsIntro: "إدارة من يمكنه تسجيل الدخول إلى الإدارة والصلاحيات",
  export: "تصدير",
  columns: "الأعمدة",
  add: "إضافة",
  excelPrintColumnVisibility: "إكسل | طباعة | إظهار/إخفاء الأعمدة",
  search: "بحث",
  email: "البريد الإلكتروني",
  webAuthorization: "صلاحية الويب",
  settingsCol: "الإعدادات",
  noResults: "لا توجد نتائج",
  showing: "عرض",
  of: "من",
  entries: "مدخلات",
  prev: "السابق",
  next: "التالي",
};

const ur: Dict = {
  dashboard: "ڈیش بورڈ",
  usersAuth: "صارفین اور اجازتیں",
  missions: "مشنز",
  employees: "ملازمین",
  drivers: "ڈرائیورز",
  technicians: "ٹیکنیشنز",
  sites: "سائٹس",
  generators: "جنریٹرز",
  reports: "رپورٹس",
  notifications: "اطلاعات",
  settings: "سیٹنگز",
  settingsGeneral: "عمومی سیٹنگز",
  settingsCities: "شہر",
  settingsZones: "زونز",
  settingsAdminLog: "ایڈمن لاگ",
  adminUsers: "ایڈمن یوزرز",
  authorizations: "اجازت نامے",
  generalSettings: "عمومی سیٹنگز",
  literPrice: "فی لیٹر قیمت",
  maxDistance: "اسٹیشن سے تصدیق کے لیے زیادہ سے زیادہ فاصلہ",
  language: "زبان",
  save: "محفوظ کریں",
  saving: "محفوظ کیا جا رہا ہے...",
  signInTitle: "سپر ایڈمن میں سائن ان کریں",
  signInSubtitle: "اپنے اکاؤنٹ میں سائن ان کرنے کے لیے تفصیلات درج کریں",
  username: "صارف نام",
  password: "پاس ورڈ",
  rememberMe: "مجھے یاد رکھیں",
  forgotPassword: "پاس ورڈ بھول گئے؟",
  login: "لاگ ان",
  signingIn: "لاگ ان کیا جا رہا ہے...",
  searchPlaceholder: "تلاش…",
  signedInAs: "کے طور پر سائن ان",
  logout: "لاگ آؤٹ",
  resetPassword: "پاس ورڈ ری سیٹ کریں",
  enterEmailToReset: "ری سیٹ لنک کے لیے اپنا ای میل درج کریں",
  sendResetLink: "ری سیٹ لنک بھیجیں",
  cancel: "منسوخ",
  resetEmailSent: "اگر اکاؤنٹ موجود ہے تو ری سیٹ ای میل بھیج دی گئی ہے۔",
  invalidEmail: "براہ کرم درست ای میل درج کریں۔",
  totalLitersToday: "آج شامل کل لیٹر",
  totalLiters30: "گزشتہ 30 دنوں میں شامل کل لیٹر",
  stcCow30: "Stc-cow – گزشتہ 30 دن",
  totalTasksStatusCount: "کل ٹاسک اسٹیٹس شمار",
  totalTasksZonesCount: "کل زونز کے ٹاسک شمار",
  noDataYet: "ابھی کوئی ڈیٹا نہیں",
  manageAdminsIntro: "انتظامیہ اور اجازتوں میں لاگ ان کی اہلیت مینیج کریں",
  export: "ایکسپورٹ",
  columns: "کالمز",
  add: "اضافہ",
  excelPrintColumnVisibility: "ایکسسل | پرنٹ | کالم نظر",
  search: "تلاش",
  email: "ای میل",
  webAuthorization: "ویب اجازت",
  settingsCol: "سیٹنگز",
  noResults: "کوئی نتیجہ نہیں",
  showing: "دکھا رہا ہے",
  of: "میں سے",
  entries: "اندرا��ات",
  prev: "پچھلا",
  next: "اگلا",
};

const dictionaries: Record<Lang, Dict> = { en, ar, ur };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLang(): Lang {
  try {
    const fromKey = (localStorage.getItem("i18n.lang") as Lang | null) || null;
    if (fromKey === "en" || fromKey === "ar" || fromKey === "ur")
      return fromKey;
    const raw = localStorage.getItem("settings.general");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        (parsed.language === "en" ||
          parsed.language === "ar" ||
          parsed.language === "ur")
      ) {
        return parsed.language;
      }
    }
  } catch {}
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang());

  useEffect(() => {
    document.documentElement.dir =
      lang === "ar" || lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("i18n.lang", l);
    } catch {}
    window.dispatchEvent(new CustomEvent("i18n:language", { detail: l }));
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "i18n.lang" &&
        (e.newValue === "en" || e.newValue === "ar" || e.newValue === "ur")
      ) {
        setLangState(e.newValue);
      }
      if (e.key === "settings.general" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const l = parsed?.language as Lang | undefined;
          if (l === "en" || l === "ar" || l === "ur") setLangState(l);
        } catch {}
      }
    };
    const onCustom = (e: Event) => {
      const l = (e as CustomEvent).detail as Lang;
      if (l === "en" || l === "ar" || l === "ur") setLangState(l);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("i18n:language", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("i18n:language", onCustom as EventListener);
    };
  }, []);

  const t = useCallback(
    (key: string) => {
      const d = dictionaries[lang] || en;
      return d[key] ?? key;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
