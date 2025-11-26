import Link from 'next/link'
import styles from './footer.module.css' // Import the CSS module

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerSection}>
                    <h3>COMPANY NAME</h3>
                    <div className={styles.companyInfo}>
                        <p>PURE AGRI</p>
                        <p>FOODSTUFF TRADING</p>
                        <p>LLC</p>
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
                    <h3>OFFICE ADDRESS</h3>
                    <p>Office No.7, 12th Floor</p>
                    <p>The Bayswater Tower</p>
                    <p>Business Bay, Dubai</p>
                    <p>United Arab Emirates</p>
                    <a href="https://maps.app.goo.gl/fppfaTVeCBNeZ6Vc8" target="_blank" rel="noopener noreferrer" className={styles.viewLocationBtn}>
                        <i className="fas fa-map-marker-alt"></i>
                        VIEW LOCATION
                    </a>
                </div>

                <div className={styles.footerSection}>
                    <h3>CONTACT US</h3>
                    <a href="tel:+971502330481" className={styles.contactLink}>
                        <i className={`${styles.contactIcon} fas fa-phone`}></i>
                        +971 502 330 481
                    </a>
                    <h3 className={styles.landLineHeader}>LAND LINE</h3>
                    <a href="tel:+97142294897" className={styles.contactLink}>
                        <i className={`${styles.contactIcon} fas fa-phone`}></i>
                        +971 (0)422 948 97
                    </a>
                </div>

                <div className={styles.footerSection}>
                    <h3>EMAIL</h3>
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
                        Privacy Policy
                    </Link>
                    <Link href="/cookie" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-cookie-bite`}></i>
                        Cookie Policy
                    </Link>
                    <Link href="/disclaimer" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-file-contract`}></i>
                        Disclaimer
                    </Link>
                    <Link href="/terms" className={styles.accessLink}>
                        <i className={`${styles.accessIcon} fas fa-handshake`}></i>
                        Our Terms
                    </Link>
                </div>
                <p className={styles.copyright}>&copy; {new Date().getFullYear()} SudaStock. All rights reserved.</p>
            </div>
        </footer>
    )
}

