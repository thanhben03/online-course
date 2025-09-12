import { useState, useEffect } from 'react';

export const useSiteRules = () => {
    const [showRules, setShowRules] = useState(false);
    const [hasAccepted, setHasAccepted] = useState(false);

    useEffect(() => {
        // Kiểm tra xem người dùng đã đồng ý nội quy chưa
        const accepted = localStorage.getItem('site_rules_accepted') === 'true';
        setHasAccepted(accepted);
        
        // Nếu chưa đồng ý, hiển thị popup
        if (!accepted) {
            setShowRules(true);
        }
    }, []);

    const acceptRules = () => {
        localStorage.setItem('site_rules_accepted', 'true');
        setHasAccepted(true);
        setShowRules(false);
    };

    const declineRules = () => {
        // Có thể chuyển hướng về trang chủ hoặc đăng xuất
        window.location.href = '/';
    };

    const resetRulesAcceptance = () => {
        localStorage.removeItem('site_rules_accepted');
        setHasAccepted(false);
        setShowRules(true);
    };

    return {
        showRules,
        hasAccepted,
        acceptRules,
        declineRules,
        resetRulesAcceptance,
        setShowRules
    };
};
