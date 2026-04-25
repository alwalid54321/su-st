'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './PartnersSection.module.css'
import { useTranslations } from 'next-intl'

const PARTNERS = [
    { id: 1, name: 'Shabour Sons Logistics', logo: '/images/partners/partner1.webp' },
    { id: 2, name: 'Pure Agri', logo: '/images/partners/partner2.webp' },
    { id: 3, name: 'Wadee', logo: '/images/partners/partner3.webp' },
    { id: 4, name: 'Altaif', logo: '/images/partners/partner4.webp' },
    { id: 5, name: 'WSG', logo: '/images/partners/partner5.webp' },
]

export default function PartnersSection() {
    const [mounted, setMounted] = useState(false)
    const t = useTranslations()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    // Duplicate items to ensure seamless infinite scroll
    const scrollingPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS]

    return (
        <section className={styles.partnersSection}>
            <div className={styles.header}>
                <h2>{t('Experience the Difference')}</h2>
                <h3>{t('Our Trusted Partners')}</h3>
            </div>

            <div className={styles.scroller}>
                <div className={styles.track}>
                    {scrollingPartners.map((partner, index) => (
                        <div key={`${partner.id}-${index}`} className={styles.partnerLogo} title={partner.name}>
                            <Image
                                src={partner.logo}
                                alt={partner.name}
                                width={150}
                                height={80}
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
