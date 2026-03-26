// partnersController.ts
import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const PARTNER_SELECT_QUERY = `
  SELECT 
    KhachHangID AS id,
    TenKH AS name,
    LoaiDoiTac AS type,
    ISNULL(SDT, '') + ' | ' + ISNULL(Email, '') AS contact,
    DiaChi AS address,
    TrangThai AS status
  FROM KhachHang
`;

export const getAllPartners = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`${PARTNER_SELECT_QUERY} ORDER BY KhachHangID DESC`);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    console.error('getAllPartners error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách đối tác/khách hàng', error: err.message });
  }
};

export const createPartner = async (req: Request, res: Response) => {
  const { tenKH, loaiDoiTac, sdt, diaChi, trangThai = 'Hoạt động' } = req.body;

  if (!tenKH) {
    return res.status(400).json({ message: 'Thiếu tên đối tác/khách hàng' });
  }

  try {
    const pool = await connectDB();

    const insertResult = await pool.request()
      .input('tenKH', sql.NVarChar(150), tenKH)
      .input('loaiDoiTac', sql.NVarChar(50), loaiDoiTac || 'Khách hàng')
      .input('sdt', sql.NVarChar(20), sdt || null)
      .input('diaChi', sql.NVarChar(200), diaChi || null)
      .input('trangThai', sql.NVarChar(50), trangThai)
      .query(`
        INSERT INTO KhachHang (TenKH, LoaiDoiTac, SDT, DiaChi, TrangThai)
        OUTPUT INSERTED.KhachHangID AS id
        VALUES (@tenKH, @loaiDoiTac, @sdt, @diaChi, @trangThai)
      `);

    const newId = insertResult.recordset[0].id;

    const result = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${PARTNER_SELECT_QUERY} WHERE KhachHangID = @id`);

    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    console.error('createPartner error:', err);
    res.status(500).json({ message: 'Lỗi tạo đối tác/khách hàng', error: err.message });
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { tenKH, loaiDoiTac, sdt, diaChi, trangThai } = req.body;

  try {
    const pool = await connectDB();

    const existing = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT KhachHangID FROM KhachHang WHERE KhachHangID = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đối tác/khách hàng' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('tenKH', sql.NVarChar(150), tenKH)
      .input('loaiDoiTac', sql.NVarChar(50), loaiDoiTac)
      .input('sdt', sql.NVarChar(20), sdt)
      .input('diaChi', sql.NVarChar(200), diaChi)
      .input('trangThai', sql.NVarChar(50), trangThai)
      .query(`
        UPDATE KhachHang
        SET 
          TenKH = @tenKH,
          LoaiDoiTac = @loaiDoiTac,
          SDT = @sdt,
          DiaChi = @diaChi,
          TrangThai = @trangThai
        WHERE KhachHangID = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`${PARTNER_SELECT_QUERY} WHERE KhachHangID = @id`);

    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    console.error('updatePartner error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật đối tác/khách hàng', error: err.message });
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM KhachHang WHERE KhachHangID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đối tác/khách hàng để xóa' });
    }

    res.status(200).json({ message: 'Xóa đối tác/khách hàng thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi xóa đối tác/khách hàng', error: err.message });
  }
};