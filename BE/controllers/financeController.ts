import { Request, Response } from 'express';
import { connectDB } from '../config/db';
import sql from 'mssql';

// Lấy danh sách chi phí theo container
export const getAllFinance = async (req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT 
        c.ContainerID as id,
        c.SoContainer as container,
        ISNULL(SUM(CASE WHEN cp.LoaiChiPhi IN (N'Cước cơ bản', N'Cước vận tải đường bộ') THEN cp.SoTien ELSE 0 END), 0) as base,
        ISNULL(SUM(CASE WHEN cp.LoaiChiPhi IN (N'Phí DEM/DET', N'Phí lưu bãi (DEM)') THEN cp.SoTien ELSE 0 END), 0) as demdet,
        ISNULL(SUM(CASE WHEN cp.LoaiChiPhi IN (N'Phí Local/Seal', N'Phí nâng hạ cảng') THEN cp.SoTien ELSE 0 END), 0) as local,
        ISNULL(SUM(CASE WHEN cp.LoaiChiPhi NOT IN (N'Cước cơ bản', N'Cước vận tải đường bộ', N'Phí DEM/DET', N'Phí lưu bãi (DEM)', N'Phí Local/Seal', N'Phí nâng hạ cảng') THEN cp.SoTien ELSE 0 END), 0) as extra,
        ISNULL(SUM(cp.SoTien), 0) as total
      FROM Container c
      INNER JOIN ChiPhi cp ON c.ContainerID = cp.ContainerID
      GROUP BY c.ContainerID, c.SoContainer
    `);
    res.json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi truy vấn database', error: err.message });
  }
};

// Lưu chi phí cho container
export const saveFinance = async (req: Request, res: Response) => {
  const { containerId, base, demdet, local, extra } = req.body;
  try {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      
      // 1. Xóa các chi phí cũ của container này
      await request
        .input('containerId', sql.Int, containerId)
        .query('DELETE FROM ChiPhi WHERE ContainerID = @containerId');

      // 2. Thêm các chi phí mới nếu có lớn hơn 0
      if (base && Number(base) > 0) {
        await new sql.Request(transaction)
          .input('containerId', sql.Int, containerId)
          .input('loai', sql.NVarChar, 'Cước cơ bản')
          .input('tien', sql.Decimal(15, 2), Number(base))
          .query('INSERT INTO ChiPhi (ContainerID, LoaiChiPhi, SoTien) VALUES (@containerId, @loai, @tien)');
      }

      if (demdet && Number(demdet) > 0) {
        await new sql.Request(transaction)
          .input('containerId', sql.Int, containerId)
          .input('loai', sql.NVarChar, 'Phí DEM/DET')
          .input('tien', sql.Decimal(15, 2), Number(demdet))
          .query('INSERT INTO ChiPhi (ContainerID, LoaiChiPhi, SoTien) VALUES (@containerId, @loai, @tien)');
      }

      if (local && Number(local) > 0) {
        await new sql.Request(transaction)
          .input('containerId', sql.Int, containerId)
          .input('loai', sql.NVarChar, 'Phí Local/Seal')
          .input('tien', sql.Decimal(15, 2), Number(local))
          .query('INSERT INTO ChiPhi (ContainerID, LoaiChiPhi, SoTien) VALUES (@containerId, @loai, @tien)');
      }

      if (extra && Number(extra) > 0) {
        await new sql.Request(transaction)
          .input('containerId', sql.Int, containerId)
          .input('loai', sql.NVarChar, 'Phí phát sinh')
          .input('tien', sql.Decimal(15, 2), Number(extra))
          .query('INSERT INTO ChiPhi (ContainerID, LoaiChiPhi, SoTien) VALUES (@containerId, @loai, @tien)');
      }

      await transaction.commit();
      res.status(200).json({ message: 'Lưu chi phí thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi lưu chi phí', error: err.message });
  }
};

// Xóa toàn bộ chi phí của container
export const deleteFinance = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM ChiPhi WHERE ContainerID = @id');
    res.json({ message: 'Xóa chi phí thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi xóa chi phí', error: err.message });
  }
};
