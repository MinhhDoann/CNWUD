import { Request, Response } from 'express';
import { connectDB } from '../config/db';
import sql from 'mssql';

const CONTAINER_SELECT_QUERY = `
  SELECT 
    c.ContainerID AS id,
    'CONT' + RIGHT('00000' + CAST(c.ContainerID AS VARCHAR(5)), 5) AS no,
    ISNULL(lh.TenLoai, N'Không xác định') AS type,
    ISNULL(k.TenKho, N'Chưa lưu kho') AS loc,
    ISNULL(c.TrangThai, N'Rỗng') AS status
  FROM Container c
  LEFT JOIN LoaiHang lh ON c.LoaiHangID = lh.LoaiHangID
  LEFT JOIN KhoLT k ON c.KhoID = k.KhoID
`;

export const getAllContainers = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      ${CONTAINER_SELECT_QUERY}
      ORDER BY c.ContainerID DESC
    `);

    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi lấy danh sách container', error: err.message });
  }
};

export const createContainer = async (req: Request, res: Response) => {
  const {
    hopDongID = 1,
    loaiHangID = 1,
    khoID = null,
    trongLuong = 0,
    status = 'Rỗng',
  } = req.body;

  try {
    const pool = await connectDB();

    const insertResult = await pool
      .request()
      .input('hopDongID', sql.Int, Number(hopDongID))
      .input('loaiHangID', sql.Int, Number(loaiHangID))
      .input('khoID', sql.Int, khoID !== null ? Number(khoID) : null)
      .input('trongLuong', sql.Decimal(10, 2), Number(trongLuong))
      .input('trangThai', sql.NVarChar(50), status)
      .query(`
        INSERT INTO Container (HopDongID, LoaiHangID, KhoID, TrongLuong, TrangThai)
        OUTPUT INSERTED.ContainerID AS id
        VALUES (@hopDongID, @loaiHangID, @khoID, @trongLuong, @trangThai)
      `);

    const newId = insertResult.recordset[0].id;

    const result = await pool.request().input('id', sql.Int, newId).query(`
      ${CONTAINER_SELECT_QUERY}
      WHERE c.ContainerID = @id
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi tạo container', error: err.message });
  }
};

export const updateContainer = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { loaiHangID, khoID, status, trongLuong } = req.body;

  try {
    const pool = await connectDB();

    const existing = await pool.request().input('id', sql.Int, id).query(`
      SELECT * FROM Container WHERE ContainerID = @id
    `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy container' });
    }

    const current = existing.recordset[0];

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('loaiHangID', sql.Int, Number(loaiHangID ?? current.LoaiHangID))
      .input('khoID', sql.Int, khoID !== undefined ? (khoID === null ? null : Number(khoID)) : current.KhoID)
      .input('trangThai', sql.NVarChar(50), status ?? current.TrangThai)
      .input('trongLuong', sql.Decimal(10, 2), Number(trongLuong ?? current.TrongLuong ?? 0))
      .query(`
        UPDATE Container
        SET 
          LoaiHangID = @loaiHangID,
          KhoID = @khoID,
          TrangThai = @trangThai,
          TrongLuong = @trongLuong
        WHERE ContainerID = @id
      `);

    const result = await pool.request().input('id', sql.Int, id).query(`
      ${CONTAINER_SELECT_QUERY}
      WHERE c.ContainerID = @id
    `);

    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi cập nhật container', error: err.message });
  }
};

export const deleteContainer = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const pool = await connectDB();

    const existing = await pool.request().input('id', sql.Int, id).query(`
      SELECT ContainerID FROM Container WHERE ContainerID = @id
    `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy container' });
    }

    await pool.request().input('id', sql.Int, id).query(`
      DELETE FROM Container WHERE ContainerID = @id
    `);

    res.status(200).json({ message: 'Xóa container thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi xóa container', error: err.message });
  }
};