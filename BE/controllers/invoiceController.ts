import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const INVOICE_SELECT_QUERY = `
  SELECT 
    hd.HoaDonID AS id,
    hd.SoHoaDon AS no,
    hd.HopDongID AS contractId,
    hd.NgayLap AS issue,
    hd.NgayHetHan AS due,
    hd.TongTien AS total,
    hd.VAT AS vat,
    hd.TrangThai AS paid,
    hd.GhiChu AS note,
    h.SoHopDong AS contractNo,
    kh.TenKH AS partner
  FROM HoaDon hd
  LEFT JOIN HopDong h ON hd.HopDongID = h.HopDongID
  LEFT JOIN KhachHang kh ON h.KhachHangID = kh.KhachHangID
`;

export const getAllInvoices = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`${INVOICE_SELECT_QUERY} ORDER BY hd.HoaDonID DESC`);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    console.error('getAllInvoices error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách hóa đơn', error: err.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  const {
    no,
    contractId,
    issue,
    due,
    total,
    vat,
    paid,
    note
  } = req.body;

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('soHoaDon', sql.NVarChar(50), no)
      .input('hopDongID', sql.Int, contractId)
      .input('ngayLap', sql.Date, issue)
      .input('ngayHetHan', sql.Date, due)
      .input('tongTien', sql.Decimal(15, 2), total)
      .input('vat', sql.Decimal(5, 2), vat)
      .input('trangThai', sql.NVarChar(50), paid)
      .input('ghiChu', sql.NVarChar(500), note)
      .query(`
        INSERT INTO HoaDon (SoHoaDon, HopDongID, NgayLap, NgayHetHan, TongTien, VAT, TrangThai, GhiChu)
        VALUES (@soHoaDon, @hopDongID, @ngayLap, @ngayHetHan, @tongTien, @vat, @trangThai, @ghiChu);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const newId = result.recordset[0].id;
    const newInvoice = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${INVOICE_SELECT_QUERY} WHERE hd.HoaDonID = @id`);

    res.status(201).json(newInvoice.recordset[0]);
  } catch (err: any) {
    console.error('createInvoice error:', err);
    res.status(500).json({ message: 'Lỗi tạo hóa đơn', error: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  const id = req.params.id;
  const {
    no,
    contractId,
    issue,
    due,
    total,
    vat,
    paid,
    note
  } = req.body;

  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.Int, id)
      .input('soHoaDon', sql.NVarChar(50), no)
      .input('hopDongID', sql.Int, contractId)
      .input('ngayLap', sql.Date, issue)
      .input('ngayHetHan', sql.Date, due)
      .input('tongTien', sql.Decimal(15, 2), total)
      .input('vat', sql.Decimal(5, 2), vat)
      .input('trangThai', sql.NVarChar(50), paid)
      .input('ghiChu', sql.NVarChar(500), note)
      .query(`
        UPDATE HoaDon
        SET 
          SoHoaDon = @soHoaDon,
          HopDongID = @hopDongID,
          NgayLap = @ngayLap,
          NgayHetHan = @ngayHetHan,
          TongTien = @tongTien,
          VAT = @vat,
          TrangThai = @trangThai,
          GhiChu = @ghiChu
        WHERE HoaDonID = @id
      `);

    const updatedInvoice = await pool.request()
      .input('id', sql.Int, id)
      .query(`${INVOICE_SELECT_QUERY} WHERE hd.HoaDonID = @id`);

    res.status(200).json(updatedInvoice.recordset[0]);
  } catch (err: any) {
    console.error('updateInvoice error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật hóa đơn', error: err.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM HoaDon WHERE HoaDonID = @id');
    res.status(200).json({ message: 'Xóa hóa đơn thành công' });
  } catch (err: any) {
    console.error('deleteInvoice error:', err);
    res.status(500).json({ message: 'Lỗi xóa hóa đơn', error: err.message });
  }
};
