"use client";

import { ReactNode } from 'react';
import { useSiteRules } from '@/hooks/useSiteRules';
import SiteRulesPopup from './SiteRulesPopup';

interface SiteRulesProviderProps {
    children: ReactNode;
}

export default function SiteRulesProvider({ children }: SiteRulesProviderProps) {
    const { showRules, acceptRules, declineRules } = useSiteRules();

    return (
        <>
            {children}
            <SiteRulesPopup
                isOpen={showRules}
                onClose={declineRules}
                onAccept={acceptRules}
            />
        </>
    );
}
