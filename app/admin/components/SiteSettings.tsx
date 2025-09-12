"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
    Settings, 
    FileText, 
    Save, 
    CheckCircle, 
    AlertCircle,
    Eye,
    EyeOff,
    Users,
    BookOpen,
    MessageCircle
} from "lucide-react";

interface SiteSetting {
    id: number;
    setting_key: string;
    setting_value: string;
    setting_type: string;
    description: string;
}

export default function SiteSettings() {
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [previewRules, setPreviewRules] = useState(false);

    // Form states
    const [siteRules, setSiteRules] = useState("");
    const [siteName, setSiteName] = useState("");
    const [siteDescription, setSiteDescription] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [enableRegistration, setEnableRegistration] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    // Stats states
    const [statsSubscribersNumber, setStatsSubscribersNumber] = useState("");
    const [statsSubscribersLabel, setStatsSubscribersLabel] = useState("");
    const [statsTopicsNumber, setStatsTopicsNumber] = useState("");
    const [statsTopicsLabel, setStatsTopicsLabel] = useState("");
    const [statsSupportNumber, setStatsSupportNumber] = useState("");
    const [statsSupportLabel, setStatsSupportLabel] = useState("");
    // Testimonials states
    interface TestimonialFormItem { id?: number; name: string; role?: string; avatar: string; content: string; rating?: number }
    const [testimonialList, setTestimonialList] = useState<TestimonialFormItem[]>([]);
    // CTA states
    const [ctaPrimaryText, setCtaPrimaryText] = useState("");
    const [ctaPrimaryHref, setCtaPrimaryHref] = useState("");
    const [ctaSecondaryText, setCtaSecondaryText] = useState("");
    const [ctaSecondaryHref, setCtaSecondaryHref] = useState("");
    // Instructor page states
    const [insName, setInsName] = useState("");
    const [insTitle, setInsTitle] = useState("");
    const [insCompany, setInsCompany] = useState("");
    const [insAvatar, setInsAvatar] = useState("");
    const [insStudents, setInsStudents] = useState("");
    const [insRating, setInsRating] = useState("");
    const [insTotalRatings, setInsTotalRatings] = useState("");
    const [insBio, setInsBio] = useState("");
    const [insExpertiseCsv, setInsExpertiseCsv] = useState("");
    const [insAchievementsCsv, setInsAchievementsCsv] = useState("");
    const [insEducationList, setInsEducationList] = useState<{ degree: string; school: string; year: string }[]>([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/site-settings");
            const data = await response.json();
            
            if (data.success && data.settings) {
                setSettings(data.settings);
                
                // Map settings to form states
                data.settings.forEach((setting: SiteSetting) => {
                    switch (setting.setting_key) {
                        case 'site_rules':
                            setSiteRules(setting.setting_value || '');
                            break;
                        case 'site_name':
                            setSiteName(setting.setting_value || '');
                            break;
                        case 'site_description':
                            setSiteDescription(setting.setting_value || '');
                            break;
                        case 'contact_email':
                            setContactEmail(setting.setting_value || '');
                            break;
                        case 'enable_registration':
                            setEnableRegistration(setting.setting_value === 'true');
                            break;
                        case 'maintenance_mode':
                            setMaintenanceMode(setting.setting_value === 'true');
                            break;
                        case 'stats_subscribers_number':
                            setStatsSubscribersNumber(setting.setting_value || '');
                            break;
                        case 'stats_subscribers_label':
                            setStatsSubscribersLabel(setting.setting_value || '');
                            break;
                        case 'stats_topics_number':
                            setStatsTopicsNumber(setting.setting_value || '');
                            break;
                        case 'stats_topics_label':
                            setStatsTopicsLabel(setting.setting_value || '');
                            break;
                        case 'stats_support_number':
                            setStatsSupportNumber(setting.setting_value || '');
                            break;
                        case 'stats_support_label':
                            setStatsSupportLabel(setting.setting_value || '');
                            break;
                        case 'homepage_testimonials':
                            try {
                                const arr = JSON.parse(setting.setting_value || '[]');
                                if (Array.isArray(arr)) setTestimonialList(arr);
                            } catch {}
                            break;
                        case 'cta_primary_text':
                            setCtaPrimaryText(setting.setting_value || '');
                            break;
                        case 'cta_primary_href':
                            setCtaPrimaryHref(setting.setting_value || '');
                            break;
                        case 'cta_secondary_text':
                            setCtaSecondaryText(setting.setting_value || '');
                            break;
                        case 'cta_secondary_href':
                            setCtaSecondaryHref(setting.setting_value || '');
                            break;
                        case 'instructor_name':
                            setInsName(setting.setting_value || '');
                            break;
                        case 'instructor_title':
                            setInsTitle(setting.setting_value || '');
                            break;
                        case 'instructor_company':
                            setInsCompany(setting.setting_value || '');
                            break;
                        case 'instructor_avatar':
                            setInsAvatar(setting.setting_value || '');
                            break;
                        case 'instructor_students':
                            setInsStudents(setting.setting_value || '');
                            break;
                        case 'instructor_rating':
                            setInsRating(setting.setting_value || '');
                            break;
                        case 'instructor_total_ratings':
                            setInsTotalRatings(setting.setting_value || '');
                            break;
                        case 'instructor_bio':
                            setInsBio(setting.setting_value || '');
                            break;
                        case 'instructor_expertise_csv':
                            setInsExpertiseCsv(setting.setting_value || '');
                            break;
                        case 'instructor_achievements_csv':
                            setInsAchievementsCsv(setting.setting_value || '');
                            break;
                        case 'instructor_education':
                            try {
                                const arr = JSON.parse(setting.setting_value || '[]');
                                if (Array.isArray(arr)) setInsEducationList(arr);
                            } catch {}
                            break;
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ type: "error", text: "Lỗi khi tải cài đặt" });
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: string | boolean) => {
        try {
            setSaving(true);
            const response = await fetch("/api/admin/site-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    setting_key: key,
                    setting_value: value.toString(),
                    setting_type: typeof value === 'boolean' ? 'boolean' : 'text',
                    description: getSettingDescription(key)
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage({ type: "success", text: "Lưu cài đặt thành công!" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: data.error || "Lỗi khi lưu cài đặt" });
            }
        } catch (error) {
            console.error("Error saving setting:", error);
            setMessage({ type: "error", text: "Lỗi khi lưu cài đặt" });
        } finally {
            setSaving(false);
        }
    };

    const getSettingDescription = (key: string): string => {
        const descriptions: { [key: string]: string } = {
            'site_rules': 'Nội quy sử dụng trang web',
            'site_name': 'Tên trang web',
            'site_description': 'Mô tả trang web',
            'contact_email': 'Email liên hệ',
            'enable_registration': 'Cho phép đăng ký tài khoản mới',
            'maintenance_mode': 'Chế độ bảo trì',
            'stats_subscribers_number': 'Thống kê: số lượng subscribers',
            'stats_subscribers_label': 'Thống kê: nhãn subscribers',
            'stats_topics_number': 'Thống kê: số chuyên đề',
            'stats_topics_label': 'Thống kê: nhãn chuyên đề',
            'stats_support_number': 'Thống kê: số hỗ trợ',
            'stats_support_label': 'Thống kê: nhãn hỗ trợ',
            'homepage_testimonials': 'Danh sách testimonials trang chủ',
            'cta_primary_text': 'CTA chính - nội dung',
            'cta_primary_href': 'CTA chính - đường dẫn',
            'cta_secondary_text': 'CTA phụ - nội dung',
            'cta_secondary_href': 'CTA phụ - đường dẫn',
            'instructor_name': 'Tên giảng viên',
            'instructor_title': 'Chức danh giảng viên',
            'instructor_company': 'Đơn vị',
            'instructor_avatar': 'Ảnh đại diện',
            'instructor_students': 'Số học viên',
            'instructor_rating': 'Điểm rating',
            'instructor_total_ratings': 'Tổng số đánh giá',
            'instructor_bio': 'Giới thiệu/Bio',
            'instructor_expertise_csv': 'Chuyên môn (CSV)',
            'instructor_achievements_csv': 'Thành tích (CSV)'
            , 'instructor_education': 'Danh sách học vấn (JSON)'
        };
        return descriptions[key] || '';
    };

    const handleSaveAll = async () => {
        const settingsToSave = [
            { key: 'site_rules', value: siteRules },
            { key: 'site_name', value: siteName },
            { key: 'site_description', value: siteDescription },
            { key: 'contact_email', value: contactEmail },
            { key: 'enable_registration', value: enableRegistration },
            { key: 'maintenance_mode', value: maintenanceMode },
            { key: 'stats_subscribers_number', value: statsSubscribersNumber },
            { key: 'stats_subscribers_label', value: statsSubscribersLabel },
            { key: 'stats_topics_number', value: statsTopicsNumber },
            { key: 'stats_topics_label', value: statsTopicsLabel },
            { key: 'stats_support_number', value: statsSupportNumber },
            { key: 'stats_support_label', value: statsSupportLabel },
            { key: 'homepage_testimonials', value: JSON.stringify(testimonialList || []) },
            // CTA
            { key: 'cta_primary_text', value: ctaPrimaryText },
            { key: 'cta_primary_href', value: ctaPrimaryHref },
            { key: 'cta_secondary_text', value: ctaSecondaryText },
            { key: 'cta_secondary_href', value: ctaSecondaryHref },
            // Instructor
            { key: 'instructor_name', value: insName },
            { key: 'instructor_title', value: insTitle },
            { key: 'instructor_company', value: insCompany },
            { key: 'instructor_avatar', value: insAvatar },
            { key: 'instructor_students', value: insStudents },
            { key: 'instructor_rating', value: insRating },
            { key: 'instructor_total_ratings', value: insTotalRatings },
            { key: 'instructor_bio', value: insBio },
            { key: 'instructor_expertise_csv', value: insExpertiseCsv },
            { key: 'instructor_achievements_csv', value: insAchievementsCsv },
            { key: 'instructor_education', value: JSON.stringify(insEducationList || []) }
        ];

        try {
            setSaving(true);
            for (const setting of settingsToSave) {
                await saveSetting(setting.key, setting.value);
            }
            setMessage({ type: "success", text: "Lưu tất cả cài đặt thành công!" });
        } catch (error) {
            setMessage({ type: "error", text: "Lỗi khi lưu cài đặt" });
        } finally {
            setSaving(false);
        }
    };

    const resetRulesToDefault = () => {
        setSiteRules(`# Nội quy sử dụng trang web

## 1. Quy định chung
- Tuân thủ pháp luật Việt Nam
- Không vi phạm bản quyền
- Không spam hoặc quấy rối người khác

## 2. Quy định về nội dung
- Không đăng nội dung phản động, khiêu dâm
- Không đăng thông tin cá nhân của người khác
- Không đăng nội dung quảng cáo không được phép

## 3. Quy định về tài khoản
- Không chia sẻ tài khoản với người khác
- Bảo mật thông tin đăng nhập
- Không tạo nhiều tài khoản giả

## 4. Quy định về học tập
- Tôn trọng giảng viên và học viên khác
- Không gian lận trong bài kiểm tra
- Tham gia thảo luận một cách tích cực

## 5. Hình thức xử lý vi phạm
- Cảnh báo lần đầu
- Tạm khóa tài khoản
- Xóa tài khoản vĩnh viễn

Bằng việc đồng ý với nội quy này, bạn cam kết tuân thủ các quy định trên.`);
    };

    const initializeDefaultSettings = async () => {
        try {
            setInitializing(true);
            const response = await fetch("/api/admin/init-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage({ type: "success", text: `Khởi tạo thành công ${data.count} cài đặt mặc định!` });
                // Reload settings sau khi khởi tạo
                await fetchSettings();
            } else {
                setMessage({ type: "error", text: data.error || "Lỗi khi khởi tạo cài đặt mặc định" });
            }
        } catch (error) {
            console.error("Error initializing settings:", error);
            setMessage({ type: "error", text: "Lỗi khi khởi tạo cài đặt mặc định" });
        } finally {
            setInitializing(false);
        }
    };

    const resetToDefaultSettings = async () => {
        if (!confirm("Bạn có chắc chắn muốn reset tất cả cài đặt về mặc định? Hành động này sẽ xóa tất cả cài đặt hiện tại.")) {
            return;
        }

        try {
            setResetting(true);
            const response = await fetch("/api/admin/reset-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage({ type: "success", text: `Reset thành công ${data.count} cài đặt về mặc định!` });
                // Reload settings sau khi reset
                await fetchSettings();
            } else {
                setMessage({ type: "error", text: data.error || "Lỗi khi reset cài đặt về mặc định" });
            }
        } catch (error) {
            console.error("Error resetting settings:", error);
            setMessage({ type: "error", text: "Lỗi khi reset cài đặt về mặc định" });
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải cài đặt...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Cài đặt trang web
                    </h2>
                    <p className="text-gray-600">
                        Quản lý cài đặt chung của trang web
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={initializeDefaultSettings}
                        disabled={initializing}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {initializing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                            <Settings className="h-4 w-4" />
                        )}
                        {initializing ? "Đang khởi tạo..." : "Khởi tạo mặc định"}
                    </Button>
                    <Button
                        onClick={resetToDefaultSettings}
                        disabled={resetting}
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                        {resetting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        {resetting ? "Đang reset..." : "Reset về mặc định"}
                    </Button>
                </div>
            </div>

            {/* Alert Messages */}
            {message && (
                <Alert
                    className={`${
                        message.type === "success"
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                    }`}
                >
                    <AlertDescription
                        className={
                            message.type === "success"
                                ? "text-green-800"
                                : "text-red-800"
                        }
                    >
                        {message.text}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
                    <TabsTrigger value="rules">Nội quy</TabsTrigger>
                    <TabsTrigger value="stats">Thống kê trang chủ</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                    <TabsTrigger value="cta">CTA Trang chủ</TabsTrigger>
                    <TabsTrigger value="instructor">Trang giảng viên</TabsTrigger>
                    <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Thông tin trang web
                            </CardTitle>
                            <CardDescription>
                                Cài đặt thông tin cơ bản của trang web
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="site-name">Tên trang web</Label>
                                <Input
                                    id="site-name"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    placeholder="Nhập tên trang web..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site-description">Mô tả trang web</Label>
                                <Textarea
                                    id="site-description"
                                    value={siteDescription}
                                    onChange={(e) => setSiteDescription(e.target.value)}
                                    placeholder="Nhập mô tả trang web..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Email liên hệ</Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="contact@example.com"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="instructor" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Nội dung trang giảng viên
                            </CardTitle>
                            <CardDescription>
                                Chỉnh sửa thông tin hiển thị ở trang giảng viên
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tên</Label>
                                    <Input
                                        value={insName}
                                        onChange={(e) => setInsName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Chức danh</Label>
                                    <Input
                                        value={insTitle}
                                        onChange={(e) => setInsTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Đơn vị</Label>
                                    <Input
                                        value={insCompany}
                                        onChange={(e) => setInsCompany(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ảnh đại diện (URL)</Label>
                                    <Input
                                        value={insAvatar}
                                        onChange={(e) => setInsAvatar(e.target.value)}
                                        placeholder="/placeholder-user.jpg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số học viên</Label>
                                    <Input
                                        type="number"
                                        value={insStudents}
                                        onChange={(e) => setInsStudents(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={insRating}
                                        onChange={(e) => setInsRating(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tổng số đánh giá</Label>
                                    <Input
                                        type="number"
                                        value={insTotalRatings}
                                        onChange={(e) => setInsTotalRatings(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Giới thiệu (Bio)</Label>
                                <Textarea
                                    rows={4}
                                    value={insBio}
                                    onChange={(e) => setInsBio(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Chuyên môn (CSV)</Label>
                                <Input
                                    value={insExpertiseCsv}
                                    onChange={(e) => setInsExpertiseCsv(e.target.value)}
                                    placeholder="Olympic Toán,Giải Tích,Toán THPT,Manim,VJIMC"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Thành tích (CSV)</Label>
                                <Input
                                    value={insAchievementsCsv}
                                    onChange={(e) => setInsAchievementsCsv(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Học vấn</Label>
                                <div className="space-y-3">
                                    {insEducationList.map((edu, idx) => (
                                        <div key={idx} className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <Input
                                                value={edu.degree}
                                                onChange={(e) => {
                                                    const copy = [...insEducationList];
                                                    copy[idx] = { ...copy[idx], degree: e.target.value };
                                                    setInsEducationList(copy);
                                                }}
                                                placeholder="Bằng cấp"
                                            />
                                            <Input
                                                value={edu.school}
                                                onChange={(e) => {
                                                    const copy = [...insEducationList];
                                                    copy[idx] = { ...copy[idx], school: e.target.value };
                                                    setInsEducationList(copy);
                                                }}
                                                placeholder="Trường"
                                            />
                                            <div className="flex gap-2">
                                                <Input
                                                    value={edu.year}
                                                    onChange={(e) => {
                                                        const copy = [...insEducationList];
                                                        copy[idx] = { ...copy[idx], year: e.target.value };
                                                        setInsEducationList(copy);
                                                    }}
                                                    placeholder="Năm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => {
                                                        const copy = [...insEducationList];
                                                        copy.splice(idx, 1);
                                                        setInsEducationList(copy);
                                                    }}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setInsEducationList([...(insEducationList || []), { degree: '', school: '', year: '' }])}
                                >
                                    Thêm học vấn
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cta" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Nút kêu gọi hành động (CTA) trên banner
                            </CardTitle>
                            <CardDescription>
                                Chỉnh nội dung và đường dẫn cho 2 nút trên banner trang chủ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CTA chính - Nội dung</Label>
                                    <Input
                                        value={ctaPrimaryText}
                                        onChange={(e) => setCtaPrimaryText(e.target.value)}
                                        placeholder="Học phí 1.500.000 VNĐ"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA chính - Đường dẫn</Label>
                                    <Input
                                        value={ctaPrimaryHref}
                                        onChange={(e) => setCtaPrimaryHref(e.target.value)}
                                        placeholder="/login"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA phụ - Nội dung</Label>
                                    <Input
                                        value={ctaSecondaryText}
                                        onChange={(e) => setCtaSecondaryText(e.target.value)}
                                        placeholder="7 chuyên đề"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA phụ - Đường dẫn</Label>
                                    <Input
                                        value={ctaSecondaryHref}
                                        onChange={(e) => setCtaSecondaryHref(e.target.value)}
                                        placeholder="/courses"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Nội quy trang web
                            </CardTitle>
                            <CardDescription>
                                Chỉnh sửa nội quy hiển thị cho người dùng
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Nội dung nội quy</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetRulesToDefault}
                                    >
                                        Khôi phục mặc định
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreviewRules(!previewRules)}
                                    >
                                        {previewRules ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        {previewRules ? "Ẩn xem trước" : "Xem trước"}
                                    </Button>
                                </div>
                            </div>

                            {previewRules ? (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div 
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ 
                                            __html: siteRules.replace(/\n/g, '<br>').replace(/# (.*)/g, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>') 
                                        }}
                                    />
                                </div>
                            ) : (
                                <Textarea
                                    value={siteRules}
                                    onChange={(e) => setSiteRules(e.target.value)}
                                    placeholder="Nhập nội dung nội quy..."
                                    rows={20}
                                    className="font-mono text-sm"
                                />
                            )}

                            <div className="text-sm text-gray-600">
                                <strong>Hướng dẫn:</strong> Sử dụng # cho tiêu đề chính, ## cho tiêu đề phụ, và - cho danh sách.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Thống kê trang chủ
                            </CardTitle>
                            <CardDescription>
                                Chỉnh sửa 3 ô thống kê hiển thị ở banner trang chủ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span>Subscribers</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Con số</Label>
                                        <Input value={statsSubscribersNumber} onChange={(e) => setStatsSubscribersNumber(e.target.value)} placeholder="2,000+" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nhãn</Label>
                                        <Input value={statsSubscribersLabel} onChange={(e) => setStatsSubscribersLabel(e.target.value)} placeholder="Subscribers" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Chuyên đề</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Con số</Label>
                                        <Input value={statsTopicsNumber} onChange={(e) => setStatsTopicsNumber(e.target.value)} placeholder="7" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nhãn</Label>
                                        <Input value={statsTopicsLabel} onChange={(e) => setStatsTopicsLabel(e.target.value)} placeholder="Chuyên đề" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>Hỗ trợ</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Con số</Label>
                                        <Input value={statsSupportNumber} onChange={(e) => setStatsSupportNumber(e.target.value)} placeholder="24/7" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nhãn</Label>
                                        <Input value={statsSupportLabel} onChange={(e) => setStatsSupportLabel(e.target.value)} placeholder="Hỗ trợ" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="testimonials" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Testimonials trang chủ
                            </CardTitle>
                            <CardDescription>
                                Thêm/sửa/xóa từng testimonial. Không cần kiến thức kỹ thuật.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {testimonialList.map((item, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Tên</Label>
                                                <Input
                                                    value={item.name || ''}
                                                    onChange={(e) => {
                                                        const copy = [...testimonialList];
                                                        copy[idx] = { ...copy[idx], name: e.target.value };
                                                        setTestimonialList(copy);
                                                    }}
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Vai trò</Label>
                                                <Input
                                                    value={item.role || ''}
                                                    onChange={(e) => {
                                                        const copy = [...testimonialList];
                                                        copy[idx] = { ...copy[idx], role: e.target.value };
                                                        setTestimonialList(copy);
                                                    }}
                                                    placeholder="Học viên"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Ảnh đại diện (URL)</Label>
                                                <Input
                                                    value={item.avatar || ''}
                                                    onChange={(e) => {
                                                        const copy = [...testimonialList];
                                                        copy[idx] = { ...copy[idx], avatar: e.target.value };
                                                        setTestimonialList(copy);
                                                    }}
                                                    placeholder="/placeholder-user.jpg"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Rating (0-5)</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={5}
                                                    value={Number(item.rating ?? 0)}
                                                    onChange={(e) => {
                                                        const copy = [...testimonialList];
                                                        copy[idx] = { ...copy[idx], rating: Number(e.target.value) };
                                                        setTestimonialList(copy);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Nội dung</Label>
                                            <Textarea
                                                rows={3}
                                                value={item.content || ''}
                                                onChange={(e) => {
                                                    const copy = [...testimonialList];
                                                    copy[idx] = { ...copy[idx], content: e.target.value };
                                                    setTestimonialList(copy);
                                                }}
                                                placeholder="Nội dung cảm nhận..."
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => {
                                                    const copy = [...testimonialList];
                                                    copy.splice(idx, 1);
                                                    setTestimonialList(copy);
                                                }}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <Button
                                    variant="outline"
                                    onClick={() => setTestimonialList([...(testimonialList || []), { name: '', role: '', avatar: '/placeholder-user.jpg', content: '', rating: 5 }])}
                                >
                                    Thêm testimonial
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt nâng cao</CardTitle>
                            <CardDescription>
                                Các cài đặt hệ thống quan trọng
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Cho phép đăng ký</Label>
                                    <p className="text-sm text-gray-500">
                                        Cho phép người dùng mới đăng ký tài khoản
                                    </p>
                                </div>
                                <Switch
                                    checked={enableRegistration}
                                    onCheckedChange={setEnableRegistration}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Chế độ bảo trì</Label>
                                    <p className="text-sm text-gray-500">
                                        Tạm thời khóa trang web để bảo trì
                                    </p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end">
                <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {saving ? "Đang lưu..." : "Lưu tất cả cài đặt"}
                </Button>
            </div>
        </div>
    );
}
