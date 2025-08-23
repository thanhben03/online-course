"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Eye, Clock, User, Shield } from 'lucide-react';

interface AdminAlert {
  id: number;
  user_id: number;
  alert_type: string;
  message: string;
  details: any;
  is_read: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function SecurityAlerts() {
  const [unreadAlerts, setUnreadAlerts] = useState<AdminAlert[]>([]);
  const [allAlerts, setAllAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Fetch unread alerts
      const unreadResponse = await fetch('/api/admin/alerts');
      const unreadData = await unreadResponse.json();
      
      // Fetch all alerts
      const allResponse = await fetch('/api/admin/alerts?all=true');
      const allData = await allResponse.json();
      
      if (unreadData.success) {
        setUnreadAlerts(unreadData.alerts);
      }
      
      if (allData.success) {
        setAllAlerts(allData.alerts);
      }
      
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Không thể tải cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertId }),
      });

      if (response.ok) {
        // Update local state
        setUnreadAlerts(prev => prev.filter(alert => alert.id !== alertId));
        setAllAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'multiple_ip_login':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'devtools_detected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadgeColor = (alertType: string) => {
    switch (alertType) {
      case 'multiple_ip_login':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'devtools_detected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const AlertCard = ({ alert, showMarkAsRead = true }: { alert: AdminAlert; showMarkAsRead?: boolean }) => {
    const details = alert.details ? 
      (typeof alert.details === 'string' ? JSON.parse(alert.details) : alert.details) 
      : null;
    
    return (
      <Card className={`mb-4 ${alert.is_read ? 'opacity-75' : 'border-orange-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getAlertIcon(alert.alert_type)}
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Cảnh báo bảo mật</span>
                  {!alert.is_read && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Mới</span>}
                </CardTitle>
                <CardDescription>
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDate(alert.created_at)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getAlertBadgeColor(alert.alert_type)}`}>
                {alert.alert_type === 'multiple_ip_login' ? 'Đăng nhập đa IP' : 
                 alert.alert_type === 'devtools_detected' ? 'Phát hiện DevTools' : 
                 alert.alert_type}
              </span>
              {!alert.is_read && showMarkAsRead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsRead(alert.id)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Đánh dấu đã đọc
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-3">
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
          
          {details && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{alert.user_name || details.user_name}</span>
                <span className="text-gray-500">({alert.user_email || details.user_email})</span>
              </div>
              
              {details.unique_ip_count && (
                <div className="text-gray-600">
                  <strong>Số IP khác nhau:</strong> {details.unique_ip_count}
                </div>
              )}
              
              {details.recent_ips && (
                <div className="text-gray-600">
                  <strong>Các IP gần đây:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {details.recent_ips.map((ip: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {ip}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {details.current_ip && (
                <div className="text-gray-600">
                  <strong>IP hiện tại:</strong> <code className="bg-gray-100 px-1 rounded">{details.current_ip}</code>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cảnh báo bảo mật</h2>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cảnh báo bảo mật</h2>
        <p className="text-gray-600">Theo dõi các hoạt động đăng nhập bất thường</p>
      </div>

      <Tabs defaultValue="unread" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unread" className="relative">
            Chưa đọc
            {unreadAlerts.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value="unread">
          {unreadAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có cảnh báo mới</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {unreadAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {allAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có cảnh báo nào</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {allAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} showMarkAsRead={!alert.is_read} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
