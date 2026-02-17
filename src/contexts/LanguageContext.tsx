'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    en: {
        // Navbar
        home: 'Home',
        about: 'About Us',
        data: 'Data',
        contact: 'Contact Us',
        products: 'Products',
        dashboard: 'Dashboard',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        adminDashboard: 'Admin Dashboard',
        myDashboard: 'My Dashboard',

        // Market Data Page
        marketInsights: 'Market Insights',
        marketSubtitle: 'Track Sudanese commodity prices and global market trends in real-time.',
        selectProduct: 'Select Product',
        selectPeriod: 'Select Period',
        customRange: 'Custom Range',
        from: 'From',
        to: 'To',
        startDate: 'Start Date',
        endDate: 'End Date',
        generateReport: 'Generate Report',
        analyzing: 'Analyzing...',
        exportCSV: 'Export CSV',
        last7Days: 'Last 7 Days',
        last14Days: 'Last 14 Days',
        last30Days: 'Last 30 Days',
        last5Months: 'Last 5 Months',
        last1Year: 'Last 1 Year',
        upgradeToPlus: 'Upgrade to Plus',
        upgradeToPremium: 'Upgrade to Premium',
        Performance: 'Performance',
        globalAverage: 'Global Average',
        portSudanFob: 'Port Sudan (FOB)',
        avgGlobalPrice: 'Avg Global Price',
        chinaDmt: 'China (DMT)',
        uaeDmt: 'UAE (DMT)',
        indiaDmt: 'India (DMT)',
        setAlert: 'Set Alert',
        trend24h: '24h Trend',
        updated: 'Updated',
        // Premium Promo
        premiumAccess: 'Premium Access',
        levelUp: 'Level Up Your Analysis with',
        plusPremium: 'Plus & Premium',
        dontMissTrends: "Don't miss out on deep market trends. Upgrade to extend your data access and unlock professional tools.",
        plusBenefits: 'Plus Benefits',
        months5History: '5 Months Market History',
        currencyConverter: 'Currency Converter',
        csvExports: 'CSV Exports',
        premiumPower: 'Premium Power',
        fullYearHistory: '1 Full Year History',
        priorityAlerts: 'Priority Alert Handling',
        unlimitedExports: 'Unlimited Data Exports',
        explorePlans: 'Explore Plans',
        contactSales: 'Contact Sales',

        // Announcements
        announcements: 'Announcements',
        viewAll: 'View All',
        fetchingBroadcasts: 'Fetching platform broadcasts...',
        details: 'Details',
        news: 'News',
        alert: 'Alert',
        update: 'Update',
        promotion: 'Promotion',

        // Price Alert Modal
        setPriceAlert: 'Set Price Alert',
        signInRequired: 'Sign In Required',
        signInAlertMsg: 'You must be signed in to set price alerts and receive real-time notifications.',
        alertSetSuccess: 'Alert Set Successfully!',
        alertFor: 'Alert for',
        notifyWhen: 'Notify me when price goes:',
        above: 'Above',
        below: 'Below',
        targetPriceSDG: 'Target Price (SDG)',
        createAlert: 'Create Alert',
        saving: 'Saving...',
        permNote: "We'll ask for notification permission when you save.",
        permBlocked: 'Notifications blocked. Check browser settings.',

        // Premium Modal
        unlockFullAccess: 'Unlock Full Access',
        getUnlimitedAccess: 'Get unlimited access to historical market data and advanced tools',
        upTo1Year: 'Up to 1 Year History',
        deepDiveTrends: 'Deep dive into market trends with Plus (5 months) or Premium (1 year) plans',
        currencyConverterDesc: 'Real-time conversion with historical trend analysis',
        exportData: 'Export Data',
        downloadCSV: 'Download market data in CSV format for offline analysis',
        viewPlansUpgrade: 'View Plans & Upgrade',
        maybeLater: 'Maybe Later',
        securePayments: 'Secure payments focused on your data privacy',

        // Footer
        companyName: 'COMPANY NAME',
        pureAgri: 'PURE AGRI',
        foodstuffTrading: 'FOODSTUFF TRADING',
        llc: 'LLC',
        officeAddress: 'OFFICE ADDRESS',
        bayswaterTower: 'The Bayswater Tower',
        businessBay: 'Business Bay, Dubai',
        uae: 'United Arab Emirates',
        viewLocation: 'VIEW LOCATION',
        contactUs: 'CONTACT US',
        landLine: 'LAND LINE',
        email: 'EMAIL',
        privacyPolicy: 'Privacy Policy',
        cookiePolicy: 'Cookie Policy',
        disclaimer: 'Disclaimer',
        ourTerms: 'Our Terms',
        allRightsReserved: 'All rights reserved.',

        // Sidebar
        marketData: 'Market Data',
        currencies: 'Currencies',
        gallery: 'Gallery',
        users: 'Users',
        settings: 'Settings',
        sudaStockAdmin: 'SudaStock Admin',
        adminUser: 'Admin User',

        // Dynamic Content Vocabulary
        'Sesame (White)': 'Sesame (White)',
        'Sesame (Red)': 'Sesame (Red)',
        'Gum Arabic': 'Gum Arabic',
        'Gold': 'Gold',
        'Groundnut': 'Groundnut',
        'Sorghum': 'Sorghum',
        'Millet': 'Millet',
        'Stable': 'Stable',
        'Rising': 'Rising',
        'Falling': 'Falling',
        'Volatile': 'Volatile',
        'Bullish': 'Bullish',
        'Bearish': 'Bearish',
        'Neutral': 'Neutral',

        // General
        sudaStock: 'SudaStock',
    },
    ar: {
        // Navbar
        home: 'الرئيسية',
        about: 'من نحن',
        data: 'البيانات',
        contact: 'اتصل بنا',
        products: 'المنتجات',
        dashboard: 'لوحة التحكم',
        login: 'تسجيل الدخول',
        register: 'تـسـجـيـل',
        logout: 'تسجيل الخروج',
        adminDashboard: 'لوحة الإدارة',
        myDashboard: 'لوحتي',

        // Market Data Page
        marketInsights: 'رؤى السوق',
        marketSubtitle: 'تتبع أسعار السلع السودانية واكتشف اتجاهات السوق العالمية في الوقت الفعلي.',
        selectProduct: 'اختر المنتج',
        selectPeriod: 'اختر الفترة',
        customRange: 'نطاق مخصص',
        from: 'من',
        to: 'إلى',
        startDate: 'تاريخ البدء',
        endDate: 'تاريخ الانتهاء',
        generateReport: 'إصدار التقرير',
        analyzing: 'جاري التحليل...',
        exportCSV: 'تصدير CSV',
        last7Days: 'آخر 7 أيام',
        last14Days: 'آخر 14 يوم',
        last30Days: 'آخر 30 يوم',
        last5Months: 'آخر 5 أشهر',
        last1Year: 'آخر سنة',
        upgradeToPlus: 'ترقية إلى بلس',
        upgradeToPremium: 'ترقية إلى بريميوم',
        Performance: 'الأداء',
        globalAverage: 'المتوسط العالمي',
        portSudanFob: 'بور تسودان (فوب)',
        avgGlobalPrice: 'متوسط السعر العالمي',
        chinaDmt: 'الصين (DMT)',
        uaeDmt: 'الإمارات (DMT)',
        indiaDmt: 'الهند (DMT)',
        setAlert: 'تنبيه',
        trend24h: 'اتجاه 24 ساعة',
        updated: 'محدث',
        upgradeBannerText: 'افتح 5 أشهر من تاريخ السوق',
        upgradeBannerSub: 'قم بالترقية إلى سوداستوك بلس للحصول على بيانات موسعة وتصدير CSV والمزيد.',

        // Premium Promo
        premiumAccess: 'وصول مميز',
        levelUp: 'ارتقِ بتحليلاتك مع',
        plusPremium: 'بلس وبريميوم',
        dontMissTrends: 'لا تفوت اتجاهات السوق العميقة. قم بالترقية لتوسيع وصولك للبيانات وفتح الأدوات الاحترافية.',
        plusBenefits: 'مزايا بلس',
        months5History: 'تاريخ السوق لمدة 5 أشهر',
        currencyConverter: 'محول العملات',
        csvExports: 'تصدير CSV',
        premiumPower: 'قوة البريميوم',
        fullYearHistory: 'تاريخ سنة كاملة',
        priorityAlerts: 'أولوية في التنبيهات',
        unlimitedExports: 'تصدير بيانات غير محدود',
        explorePlans: 'استكشف الخطط',
        contactSales: 'اتصل بالمبيعات',

        // Announcements
        announcements: 'الإعلانات',
        viewAll: 'عرض الكل',
        fetchingBroadcasts: 'جلب بث المنصة...',
        details: 'التفاصيل',
        news: 'أخبار',
        alert: 'تنبيه',
        update: 'تحديث',
        promotion: 'ترويج',

        // Price Alert Modal
        setPriceAlert: 'ضبط تنبيه السعر',
        signInRequired: 'تسجيل الدخول مطلوب',
        signInAlertMsg: 'يجب عليك تسجيل الدخول لضبط تنبيهات الأسعار وتلقي إشعارات فورية.',
        alertSetSuccess: 'تم ضبط التنبيه بنجاح!',
        alertFor: 'تنبيه لـ',
        notifyWhen: 'أخبرني عندما يصبح السعر:',
        above: 'أعلى من',
        below: 'أقل من',
        targetPriceSDG: 'السعر المستهدف (ج.س)',
        createAlert: 'إنشاء تنبيه',
        saving: 'جاري الحفظ...',
        permNote: 'سنطلب إذن الإشعارات عند الحفظ.',
        permBlocked: 'الإشعارات محظورة. تحقق من إعدادات المتصفح.',

        // Premium Modal
        unlockFullAccess: 'افتح الوصول الكامل',
        getUnlimitedAccess: 'احصل على وصول غير محدود لبيانات السوق التاريخية والأدوات المتقدمة',
        upTo1Year: 'تاريخ يصل إلى سنة واحدة',
        deepDiveTrends: 'تعمق في اتجاهات السوق مع خطط بلس (5 أشهر) أو بريميوم (1 سنة)',
        currencyConverterDesc: 'تحويل فوري مع تحليل الاتجاه التاريخي',
        exportData: 'تصدير البيانات',
        downloadCSV: 'قم بتنزيل بيانات السوق بتنسيق CSV للتحليل دون اتصال بالإنترنت',
        viewPlansUpgrade: 'عروض الخطط والترقية',
        maybeLater: 'ربما لاحقاً',
        securePayments: 'مدفوعات آمنة تركز على خصوصية بياناتك',

        // Footer
        companyName: 'اسم الشركة',
        pureAgri: 'بيور أجري',
        foodstuffTrading: 'لتجارة المواد الغذائية',
        llc: 'ذ.م.م',
        officeAddress: 'عنوان المكتب',
        bayswaterTower: 'برج بيزواتر',
        businessBay: 'الخليج التجاري، دبي',
        uae: 'الإمارات العربية المتحدة',
        viewLocation: 'عرض الموقع',
        contactUs: 'اتصل بنا',
        landLine: 'هاتف أرضي',
        email: 'البريد الإلكتروني',
        privacyPolicy: 'سياسة الخصوصية',
        cookiePolicy: 'سياسة ملفات تعريف الارتباط',
        disclaimer: 'إخلاء المسؤولية',
        ourTerms: 'شروطنا',
        allRightsReserved: 'جميع الحقوق محفوظة.',

        // Sidebar
        marketData: 'بيانات السوق',
        currencies: 'العملات',
        gallery: 'المعرض',
        users: 'المستخدمين',
        settings: 'الإعدادات',
        sudaStockAdmin: 'إدارة سوداستوك',
        adminUser: 'المسؤول',

        // Dynamic Content Vocabulary
        'Sesame (White)': 'سمسم (أبيض)',
        'Sesame (Red)': 'سمسم (أحمر)',
        'Gum Arabic': 'الصمغ العربي',
        'Gold': 'الذهب',
        'Groundnut': 'الفول السوداني',
        'Sorghum': 'الذرة',
        'Millet': 'الدخن',
        'Stable': 'مستقر',
        'Rising': 'مرتفع',
        'Falling': 'منخفض',
        'Volatile': 'متذبذب',
        'Bullish': 'صاعد',
        'Bearish': 'هابط',
        'Neutral': 'محايد',

        // General
        sudaStock: 'سوداستوك',
    }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [direction, setDirection] = useState<Direction>('ltr');

    useEffect(() => {
        // Load saved language preference
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
            setLanguageState(savedLang);
            setDirection(savedLang === 'ar' ? 'rtl' : 'ltr');
            document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = savedLang;
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setDirection(lang === 'ar' ? 'rtl' : 'ltr');
        localStorage.setItem('language', lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
