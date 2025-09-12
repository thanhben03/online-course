"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface SiteRulesLinkProps {
    children: React.ReactNode;
    className?: string;
    variant?: "link" | "button";
}

export default function SiteRulesLink({ children, className = "", variant = "link" }: SiteRulesLinkProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [rules, setRules] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setIsOpen(true);
        await fetchRules();
    };

    const fetchRules = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/site-rules");
            const data = await response.json();
            
            if (data.success && data.rules) {
                setRules(data.rules);
            } else {
                setRules("Không thể tải nội quy. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Error fetching site rules:", error);
            setRules("Không thể tải nội quy. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    if (variant === "button") {
        return (
            <>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    className={className}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    {children}
                </Button>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Nội quy sử dụng trang web
                            </DialogTitle>
                            <DialogDescription>
                                Nội quy và quy định sử dụng trang web
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-96 border rounded-lg p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2">Đang tải nội quy...</span>
                                    </div>
                                ) : (
                                    <div 
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ 
                                            __html: rules.replace(/\n/g, '<br>').replace(/# (.*)/g, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>') 
                                        }}
                                    />
                                )}
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <>
            <button
                onClick={handleClick}
                className={`text-blue-600 hover:text-blue-800 underline ${className}`}
            >
                {children}
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Nội quy sử dụng trang web
                        </DialogTitle>
                        <DialogDescription>
                            Nội quy và quy định sử dụng trang web
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-96 border rounded-lg p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2">Đang tải nội quy...</span>
                            </div>
                        ) : (
                            <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: rules.replace(/\n/g, '<br>').replace(/# (.*)/g, '<h1>$1</h1>').replace(/## (.*)/g, '<h2>$1</h2>') 
                                }}
                            />
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
