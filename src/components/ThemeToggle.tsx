'use client';

import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sudastock-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (saved === 'light') {
      setIsDark(false);
      document.documentElement.removeAttribute('data-theme');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sudastock-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('sudastock-theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <Tooltip title={isDark ? t('Light Mode') : t('Dark Mode')}>
      <IconButton
        onClick={toggleTheme}
        className="theme-toggle-btn"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        sx={{
          width: 40,
          height: 40,
          border: '2px solid',
          borderColor: isDark ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.2)',
          color: isDark ? '#c9a84c' : 'inherit',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#c9a84c',
            boxShadow: '0 0 16px rgba(201,168,76,0.25)',
            transform: 'scale(1.1)',
          },
        }}
      >
        {isDark ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </IconButton>
    </Tooltip>
  );
}
