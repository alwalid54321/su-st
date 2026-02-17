import Link from 'next/link'
import styles from './footer.module.css' // Import the CSS module
import SystemStatus from './SystemStatus'
import ScrollToTop from './ScrollToTop'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
    const { t, language } = useLanguage()

    return (
        <footer className={styles.footer} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.footerContent}>
                <div className={styles.footerSection}>
                    <h3>{t('companyName')}</h3>
                    <div className={styles.companyInfo}>
                        <p>{t('pureAgri')}</p>
                        <p>{t('foodstuffTrading')}</p>
                        <p>{t('llc')}</p>
                    </div>
                    <div className={styles.socialLinks}>
                        <a href="https://wa.me/971502330481" target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} ${styles.whatsapp}`}>
                            <i className="fab fa-whatsapp"></i>
                        </a>
                        <a href="https://facebook.com/company" target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} ${styles.facebook}`}>
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://instagram.com/company" target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} ${styles.instagram}`}>
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://linkedin.com/company" target="_blank" rel="noopener noreferrer" className={`${styles.socialLink} ${styles.linkedin}`}>
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                        <a href="mailto:info@sudanstock.com" className={`${styles.socialLink} ${styles.email}`}>
                            <i className="fas fa-envelope"></i>
                        </a>
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h3>{t('officeAddress')}</h3>
                    <p>{t('bayswaterTower')}</p>
                    <p>{t('businessBay')}</p>
                    <p>{t('uae')}</p>
                    <a href="https://maps.app.goo.gl/fppfaTVeCBNeZ6Vc8" target="_blank" rel="noopener noreferrer" className={styles.viewLocationBtn}>
                        <i className={`fas ${language === 'ar' ? 'fa-map-marker-alt' : 'fa-map-marker-alt'}`}></i>
                        {t('viewLocation')}
                    </a>
                </div>

                <div className={styles.footerSection}>
                    <h3>{t('contactUs')}</h3>
                    <a href="tel:+971502330481" className={styles.contactLink}>
                        <i className={`${styles.contactIcon} fas fa-phone`}></i>
                        +971 502 330 481
                    </a>
                    <h3 className={styles.landLineHeader}>{t('landLine')}</h3>
                    <a href="tel:+97142294897" className={styles.contactLink}>
                        <i className={`${styles.contactIcon} fas fa-phone`}></i>
                        +971 (0)422 948 97
                    </a>
                </div>

                <div className={styles.footerSection}>
                    <h3>{t('email')}</h3>
                    <a href="mailto:info@sudanstock.com" className={styles.contactLink}>
                        <i className={`${styles.contactIcon} fas fa-envelope`}></i>
                        info@sudanstock.com
                    </a>
                    <a href="mailto:Sudanstock249@gmail.com" className={styles.contactLink}>
                        <i className={`${styles.contactIcon} fas fa-envelope`}></i>
                        Sudanstock249@gmail.com
                    </a>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className={styles.accessLinks}>
                    <Link href="/privacy" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-shield-alt`}></i>
                        {t('privacyPolicy')}
                    </Link>
                    <Link href="/cookie" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-cookie-bite`}></i>
                        {t('cookiePolicy')}
                    </Link>
                    <Link href="/disclaimer" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-file-contract`}></i>
                        {t('disclaimer')}
                    </Link>
                    <Link href="/terms" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-handshake`}></i>
                        {t('ourTerms')}
                    </Link>
                </div>
                <div className="flex flex-col items-center gap-2 mt-4 md:mt-0">
                    <p className={styles.copyright}>&copy; {new Date().getFullYear()} {t('sudaStock')}. {t('allRightsReserved')}</p>
                    <SystemStatus />
                </div>
            </div>
            <ScrollToTop />
        </footer>
    )
}

