"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, FileText } from "lucide-react";

interface SiteRulesPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export default function SiteRulesPopup({ isOpen, onClose, onAccept }: SiteRulesPopupProps) {
    const [rules, setRules] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSiteRules();
        }
    }, [isOpen]);

    const fetchSiteRules = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/site-rules");
            const data = await response.json();
            
            if (data.success && data.rules) {
                setRules(data.rules);
            } else {
                // Nếu không có nội quy, sử dụng nội quy mặc định
                setRules(`# Nội quy sử dụng trang web

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
            }
        } catch (error) {
            console.error("Error fetching site rules:", error);
            setRules("Không thể tải nội quy. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        if (accepted) {
            // Lưu vào localStorage để không hiển thị lại
            localStorage.setItem("site_rules_accepted", "true");
            onAccept();
        }
    };

    const handleDecline = () => {
        // Có thể chuyển hướng về trang chủ hoặc đăng xuất
        window.location.href = "/";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Nội quy sử dụng trang web
                    </DialogTitle>
                    <DialogDescription>
                        Vui lòng đọc kỹ nội quy trước khi sử dụng trang web
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-4 min-h-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Đang tải nội quy...</span>
                        </div>
                    ) : (
                        <ScrollArea className="h-80 border rounded-lg p-4">
                            <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: rules.replace(/\n/g, '<br>').replace(/# (.*)/g, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>') 
                                }}
                            />
                        </ScrollArea>
                    )}

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="accept-rules"
                            checked={accepted}
                            onCheckedChange={(checked) => setAccepted(checked as boolean)}
                        />
                        <label
                            htmlFor="accept-rules"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Tôi đã đọc và đồng ý với nội quy sử dụng trang web
                        </label>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Bạn phải đồng ý với nội quy để tiếp tục sử dụng trang web.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleDecline}
                        className="text-red-600 hover:text-red-700"
                    >
                        Không đồng ý
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={!accepted}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Đồng ý và tiếp tục
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
