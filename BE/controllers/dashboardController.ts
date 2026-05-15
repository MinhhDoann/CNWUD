import { Request, Response } from 'express';
import { connectDB } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  let step = 'Khởi tạo';
  try {
    const pool = await connectDB();
    
    // 1. Container stats
    step = 'Truy vấn Container stats';
    const containerStats = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN TrangThai = N'Đang vận chuyển' THEN 1 ELSE 0 END) as inTransit,
        SUM(CASE WHEN TrangThai = N'Rỗng' THEN 1 ELSE 0 END) as empty,
        SUM(CASE WHEN TrangThai = N'Đầy hàng' THEN 1 ELSE 0 END) as isFull
      FROM Container
    `);

    // 2. Partner stats
    step = 'Truy vấn Partner stats';
    const partnerStats = await pool.request().query(`
      SELECT COUNT(*) as total FROM KhachHang
    `);

    // 3. Staff stats
    step = 'Truy vấn Staff stats';
    const staffStats = await pool.request().query(`
      SELECT COUNT(*) as total FROM Users
    `);

    // 4. Finance stats (Revenue)
    step = 'Truy vấn Finance stats';
    const financeStats = await pool.request().query(`
      SELECT 
        SUM(TongTien) as totalRevenue,
        COUNT(*) as totalInvoices,
        SUM(CASE WHEN TrangThai = N'Đã thanh toán' THEN TongTien ELSE 0 END) as paidRevenue
      FROM HoaDon
    `);

    // 5. Recent activities
    step = 'Truy vấn Recent activities';
    const recentContainers = await pool.request().query(`
      SELECT TOP 5 SoContainer as no, TrangThai as status, ViTri as loc
      FROM Container
      ORDER BY ContainerID DESC
    `);

    step = 'Chuẩn bị dữ liệu trả về';
    const result = {
      containers: {
        total: containerStats.recordset[0]?.total || 0,
        inTransit: containerStats.recordset[0]?.inTransit || 0,
        empty: containerStats.recordset[0]?.empty || 0,
        isFull: containerStats.recordset[0]?.isFull || 0
      },
      partners: partnerStats.recordset[0]?.total || 0,
      staff: staffStats.recordset[0]?.total || 0,
      finance: {
        totalRevenue: financeStats.recordset[0]?.totalRevenue || 0,
        totalInvoices: financeStats.recordset[0]?.totalInvoices || 0,
        paidRevenue: financeStats.recordset[0]?.paidRevenue || 0
      },
      recentContainers: recentContainers.recordset || []
    };

    res.json(result);
  } catch (err: any) {
    console.error(`Dashboard Error at [${step}]:`, err);
    res.status(500).json({ 
      message: `Lỗi tại bước: ${step}`, 
      error: err.message 
    });
  }
};
