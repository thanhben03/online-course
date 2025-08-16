import sql from '@/lib/db';

interface LoginSession {
  id: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  login_at: string;
}

interface AdminAlert {
  id: number;
  user_id: number;
  alert_type: string;
  message: string;
  details: any;
  is_read: boolean;
  created_at: string;
}

export const loginSecurityService = {
  // Ghi lại session đăng nhập
  async recordLoginSession(userId: number, ipAddress: string, userAgent: string): Promise<LoginSession> {
    const result = await sql`
      INSERT INTO login_sessions (user_id, ip_address, user_agent)
      VALUES (${userId}, ${ipAddress}, ${userAgent})
      RETURNING id, user_id, ip_address, user_agent, login_at
    `;
    
    return result[0] as LoginSession;
  },

  // Lấy danh sách IP đã đăng nhập trong 30 ngày qua
  async getRecentLoginIPs(userId: number, days: number = 30): Promise<string[]> {
    const result = await sql`
      SELECT DISTINCT ip_address 
      FROM login_sessions 
      WHERE user_id = ${userId} 
        AND login_at >= NOW() - INTERVAL '${days} days'
      ORDER BY ip_address
    `;
    
    return result.map(row => row.ip_address);
  },

  // Kiểm tra số lượng IP khác nhau đã đăng nhập
  async countUniqueIPs(userId: number, days: number = 30): Promise<number> {
    const result = await sql`
      SELECT COUNT(DISTINCT ip_address) as ip_count
      FROM login_sessions 
      WHERE user_id = ${userId} 
        AND login_at >= NOW() - INTERVAL '${days} days'
    `;
    
    return parseInt(result[0].ip_count);
  },

  // Tạo cảnh báo cho admin
  async createAdminAlert(
    userId: number, 
    alertType: string, 
    message: string, 
    details: any = null
  ): Promise<AdminAlert> {
    const result = await sql`
      INSERT INTO admin_alerts (user_id, alert_type, message, details)
      VALUES (${userId}, ${alertType}, ${message}, ${details ? JSON.stringify(details) : null})
      RETURNING id, user_id, alert_type, message, details, is_read, created_at
    `;
    
    return result[0] as AdminAlert;
  },

  // Lấy danh sách cảnh báo chưa đọc
  async getUnreadAlerts(): Promise<AdminAlert[]> {
    const result = await sql`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM admin_alerts a
      JOIN users u ON a.user_id = u.id
      WHERE a.is_read = false
      ORDER BY a.created_at DESC
    `;
    
    return result as AdminAlert[];
  },

  // Lấy tất cả cảnh báo (có phân trang)
  async getAllAlerts(limit: number = 100, offset: number = 0): Promise<AdminAlert[]> {
    const result = await sql`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM admin_alerts a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return result as AdminAlert[];
  },

  // Đánh dấu cảnh báo đã đọc
  async markAlertAsRead(alertId: number): Promise<void> {
    await sql`
      UPDATE admin_alerts 
      SET is_read = true 
      WHERE id = ${alertId}
    `;
  },

  // Kiểm tra và tạo cảnh báo nếu cần thiết
  async checkAndCreateMultipleIPAlert(userId: number, currentIP: string): Promise<boolean> {
    // Lấy thông tin user
    const userResult = await sql`
      SELECT name, email FROM users WHERE id = ${userId}
    `;
    
    if (userResult.length === 0) {
      return false;
    }

    const user = userResult[0];
    
    // Đếm số IP khác nhau trong 30 ngày qua
    const uniqueIPCount = await this.countUniqueIPs(userId);
    const recentIPs = await this.getRecentLoginIPs(userId);
    
    // Nếu đạt ngưỡng 3 IP khác nhau, tạo cảnh báo
    if (uniqueIPCount >= 3) {
      // Kiểm tra xem đã có cảnh báo về multiple IP trong 24h qua chưa
      const existingAlert = await sql`
        SELECT id FROM admin_alerts 
        WHERE user_id = ${userId} 
          AND alert_type = 'multiple_ip_login'
          AND created_at >= NOW() - INTERVAL '24 hours'
      `;

      // Chỉ tạo cảnh báo mới nếu chưa có trong 24h qua
      if (existingAlert.length === 0) {
        const alertMessage = `Tài khoản "${user.name}" (${user.email}) đã đăng nhập từ ${uniqueIPCount} IP khác nhau trong 30 ngày qua.`;
        const alertDetails = {
          user_id: userId,
          user_name: user.name,
          user_email: user.email,
          unique_ip_count: uniqueIPCount,
          recent_ips: recentIPs,
          current_ip: currentIP,
          timestamp: new Date().toISOString()
        };

        await this.createAdminAlert(
          userId,
          'multiple_ip_login',
          alertMessage,
          alertDetails
        );

        return true;
      }
    }

    return false;
  },

  // Lấy lịch sử đăng nhập của user
  async getUserLoginHistory(userId: number, limit: number = 50): Promise<LoginSession[]> {
    const result = await sql`
      SELECT id, user_id, ip_address, user_agent, login_at
      FROM login_sessions 
      WHERE user_id = ${userId}
      ORDER BY login_at DESC
      LIMIT ${limit}
    `;
    
    return result as LoginSession[];
  },

  // Lấy thống kê đăng nhập
  async getLoginStats(userId: number): Promise<{
    total_logins: number;
    unique_ips: number;
    first_login: string | null;
    last_login: string | null;
  }> {
    const result = await sql`
      SELECT 
        COUNT(*) as total_logins,
        COUNT(DISTINCT ip_address) as unique_ips,
        MIN(login_at) as first_login,
        MAX(login_at) as last_login
      FROM login_sessions 
      WHERE user_id = ${userId}
    `;
    
    return result[0] as {
      total_logins: number;
      unique_ips: number;
      first_login: string | null;
      last_login: string | null;
    };
  }
};
