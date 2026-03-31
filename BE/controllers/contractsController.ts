import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const CONTRACT_SELECT_QUERY = `
  SELECT 
    h.HopDongID AS id,
    CAST(h.HopDongID AS VARCHAR(20)) AS no,
    ISNULL(kh.TenKH, N'Không xác định') AS partner,
    kh.KhachHangID AS partnerId,
    h.NgayKy AS start,
    h.NgayHetHan AS [end],
    ISNULL(h.LoaiDichVu, '') AS type,
    ISNULL(h.TrangThai, N'Chờ ký') AS status,
    NULL AS note
  FROM HopDong h
  LEFT JOIN KhachHang kh ON h.KhachHangID = kh.KhachHangID
`;

export const getAllContracts = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      ${CONTRACT_SELECT_QUERY}
      ORDER BY h.HopDongID DESC
    `);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    console.error('getAllContracts error:', err);
    res.status(500).json({ 
      message: 'Lỗi lấy danh sách hợp đồng', 
      error: err.message 
    });
  }
};

export const createContract = async (req: Request, res: Response) => {
  const { 
    partnerId, 
    start, 
    end = null, 
    type = null, 
    status = 'Chờ ký', 
    note = null 
  } = req.body;

  if (!partnerId || !start) {
    return res.status(400).json({ message: 'Thiếu partnerId hoặc ngày ký' });
  }

  try {
    const pool = await connectDB();

    const insertResult = await pool
      .request()
      .input('khachHangID', sql.Int, Number(partnerId))
      .input('ngayKy', sql.Date, start)
      .input('ngayHetHan', sql.Date, end)
      .input('loaiDichVu', sql.NVarChar(100), type)
      .input('trangThai', sql.NVarChar(50), status)
      .query(`
        INSERT INTO HopDong (KhachHangID, NgayKy, NgayHetHan, LoaiDichVu, TrangThai)
        OUTPUT INSERTED.HopDongID AS id
        VALUES (@khachHangID, @ngayKy, @ngayHetHan, @loaiDichVu, @trangThai)
      `);

    const newId = insertResult.recordset[0].id;

    const result = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${CONTRACT_SELECT_QUERY} WHERE h.HopDongID = @id`);

    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    console.error('createContract error:', err);
    res.status(500).json({ 
      message: 'Lỗi tạo hợp đồng', 
      error: err.message 
    });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { partnerId, start, end, type, status } = req.body;

  try {
    const pool = await connectDB();

    const existing = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM HopDong WHERE HopDongID = @id`);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    const current = existing.recordset[0];

    await pool.request()
      .input('id', sql.Int, id)
      .input('khachHangID', sql.Int, partnerId ? Number(partnerId) : current.KhachHangID)
      .input('ngayKy', sql.Date, start ?? current.NgayKy)
      .input('ngayHetHan', sql.Date, end !== undefined ? end : current.NgayHetHan)
      .input('loaiDichVu', sql.NVarChar(100), type ?? current.LoaiDichVu)
      .input('trangThai', sql.NVarChar(50), status ?? current.TrangThai)
      .query(`
        UPDATE HopDong
        SET 
          KhachHangID = @khachHangID,
          NgayKy = @ngayKy,
          NgayHetHan = @ngayHetHan,
          LoaiDichVu = @loaiDichVu,
          TrangThai = @trangThai
        WHERE HopDongID = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`${CONTRACT_SELECT_QUERY} WHERE h.HopDongID = @id`);

    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    console.error('updateContract error:', err);
    res.status(500).json({ 
      message: 'Lỗi cập nhật hợp đồng', 
      error: err.message 
    });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const pool = await connectDB();

    const existing = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT HopDongID FROM HopDong WHERE HopDongID = @id`);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM HopDong WHERE HopDongID = @id`);

    res.status(200).json({ message: 'Xóa hợp đồng thành công' });
  } catch (err: any) {
    console.error('deleteContract error:', err);
    res.status(500).json({ 
      message: 'Lỗi xóa hợp đồng', 
      error: err.message 
    });
  }
};