// transportController.ts
import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const TRANSPORT_SELECT_QUERY = `
  SELECT 
    c.ChuyenDiID AS id,
    c.MaChuyen AS ref,
    ISNULL(con.SoContainer, 'N/A') AS containerNo,
    con.ContainerID AS containerId,
    ISNULL(p.LoaiPhuongTien, N'Không xác định') AS vehicleType,
    ISNULL(p.BienSo, 'N/A') AS vehicleNo,
    FORMAT(c.NgayKhoiHanh, 'yyyy-MM-dd') AS ngayKhoiHanh,
    FORMAT(c.NgayDuKienDen, 'yyyy-MM-dd') AS eta,
    ISNULL(c.TrangThai, N'Chuẩn bị') AS status
  FROM ChuyenDi c
  LEFT JOIN Container con ON c.ContainerID = con.ContainerID
  LEFT JOIN PhuongTien p ON c.PhuongTienID = p.PhuongTienID
`;

export const getAllTransports = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`${TRANSPORT_SELECT_QUERY} ORDER BY c.ChuyenDiID DESC`);
    
    console.log(`✅ Lấy ${result.recordset.length} lịch trình vận tải`);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    console.error('getAllTransports error:', err);
    res.status(500).json({ 
      message: 'Lỗi lấy danh sách lịch trình vận tải', 
      error: err.message 
    });
  }
};

export const createTransport = async (req: Request, res: Response) => {
  const { ref, containerId, vehicleId, ngayKhoiHanh, eta, status = 'Chuẩn bị' } = req.body; 

  if (!ref || !containerId || !vehicleId || !ngayKhoiHanh || !eta) {
    return res.status(400).json({ 
      message: 'Thiếu thông tin bắt buộc: ref, containerId, vehicleId, ngayKhoiHanh, eta' 
    });
  }

  try {
    const pool = await connectDB();

    const insertResult = await pool.request()
      .input('ref', sql.NVarChar(50), ref)
      .input('containerId', sql.Int, containerId)
      .input('vehicleId', sql.Int, vehicleId)
      .input('ngayKhoiHanh', sql.Date, ngayKhoiHanh)
      .input('eta', sql.Date, eta)
      .input('status', sql.NVarChar(50), status)
      .query(`
        INSERT INTO ChuyenDi 
          (MaChuyen, ContainerID, PhuongTienID, NgayKhoiHanh, NgayDuKienDen, TrangThai)
        OUTPUT INSERTED.ChuyenDiID AS id
        VALUES (@ref, @containerId, @vehicleId, @ngayKhoiHanh, @eta, @status)
      `);

    const newId = insertResult.recordset[0].id;

    const result = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${TRANSPORT_SELECT_QUERY} WHERE c.ChuyenDiID = @id`);

    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    console.error('createTransport error:', err);
    res.status(500).json({ 
      message: 'Lỗi tạo lịch trình vận tải', 
      error: err.message 
    });
  }
};

export const updateTransport = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { ref, containerId, vehicleId, ngayKhoiHanh, eta, status } = req.body;

  try {
    const pool = await connectDB();

    const existing = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT ChuyenDiID FROM ChuyenDi WHERE ChuyenDiID = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch trình vận tải' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('ref', sql.NVarChar(50), ref)
      .input('containerId', sql.Int, containerId)
      .input('vehicleId', sql.Int, vehicleId)
      .input('ngayKhoiHanh', sql.Date, ngayKhoiHanh)
      .input('eta', sql.Date, eta)
      .input('status', sql.NVarChar(50), status)
      .query(`
        UPDATE ChuyenDi 
        SET 
          MaChuyen = ISNULL(@ref, MaChuyen),
          ContainerID = @containerId,
          PhuongTienID = @vehicleId,
          NgayKhoiHanh = @ngayKhoiHanh,
          NgayDuKienDen = @eta,
          TrangThai = ISNULL(@status, TrangThai)
        WHERE ChuyenDiID = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`${TRANSPORT_SELECT_QUERY} WHERE c.ChuyenDiID = @id`);

    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    console.error('updateTransport error:', err);
    res.status(500).json({ 
      message: 'Lỗi cập nhật lịch trình vận tải', 
      error: err.message 
    });
  }
};

export const deleteTransport = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM ChuyenDi WHERE ChuyenDiID = @id');

    res.status(200).json({ message: 'Xóa lịch trình vận tải thành công' });
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Lỗi khi xóa lịch trình vận tải', 
      error: err.message 
    });
  }
};