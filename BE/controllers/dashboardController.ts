import { Request, Response } from 'express';
import { connectDB } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    
    // 1. Container stats
    const containerStats = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN TrangThai = N'Đang vận chuyển' THEN 1 ELSE 0 END) as inTransit,
        SUM(CASE WHEN TrangThai = N'Rỗng' THEN 1 ELSE 0 END) as empty,
        SUM(CASE WHEN TrangThai = N'Đầy hàng' THEN 1 ELSE 0 END) as full
      FROM Container
    `);

    // 2. Partner stats
    const partnerStats = await pool.request().query(`
      SELECT COUNT(*) as total FROM KhachHang
    `);

    // 3. Staff stats
    const staffStats = await pool.request().query(`
      SELECT COUNT(*) as total FROM Users
    `);

    // 4. Finance stats (Revenue)
    const financeStats = await pool.request().query(`
      SELECT 
        SUM(TongTien) as totalRevenue,
        COUNT(*) as totalInvoices,
        SUM(CASE WHEN TrangThai = N'Đã thanh toán' THEN TongTien ELSE 0 END) as paidRevenue
      FROM HoaDon
    `);

    // 5. Recent activities (Latest 5 containers)
    const recentContainers = await pool.request().query(`
      SELECT TOP 5 SoContainer as no, TrangThai as status, ViTri as loc
      FROM Container
      ORDER BY ContainerID DESC
    `);

    res.json({
      containers: containerStats.recordset[0],
      partners: partnerStats.recordset[0].total,
      staff: staffStats.recordset[0].total,
      finance: financeStats.recordset[0],
      recentContainers: recentContainers.recordset
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi truy vấn dashboard', error: err.message });
  }
};
