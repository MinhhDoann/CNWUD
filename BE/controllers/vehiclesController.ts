// vehiclesController.ts
import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const VEHICLE_SELECT_QUERY = `
  SELECT 
    PhuongTienID,
    LoaiPhuongTien,
    BienSo,
    TaiTrong,
    TrangThai,
    MoTa
  FROM PhuongTien
`;

export const getAllVehicles = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`${VEHICLE_SELECT_QUERY} ORDER BY PhuongTienID DESC`);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Lỗi lấy danh sách phương tiện', 
      error: err.message 
    });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  const { loaiPhuongTien, bienSo, taiTrong, trangThai, moTa } = req.body;

  try {
    const pool = await connectDB();

    const insertResult = await pool.request()
      .input('loaiPhuongTien', sql.NVarChar(50), loaiPhuongTien)
      .input('bienSo', sql.NVarChar(20), bienSo)
      .input('taiTrong', sql.Decimal(10, 2), taiTrong || 0)
      .input('trangThai', sql.NVarChar(50), trangThai || 'Sẵn sàng')
      .input('moTa', sql.NVarChar(500), moTa || null)
      .query(`
        INSERT INTO PhuongTien (LoaiPhuongTien, BienSo, TaiTrong, TrangThai, MoTa)
        OUTPUT INSERTED.PhuongTienID
        VALUES (@loaiPhuongTien, @bienSo, @taiTrong, @trangThai, @moTa)
      `);

    const newId = insertResult.recordset[0].PhuongTienID;

    const result = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${VEHICLE_SELECT_QUERY} WHERE PhuongTienID = @id`);

    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Lỗi tạo phương tiện', 
      error: err.message 
    });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { loaiPhuongTien, bienSo, taiTrong, trangThai, moTa } = req.body;

  try {
    const pool = await connectDB();

    const existing = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT PhuongTienID FROM PhuongTien WHERE PhuongTienID = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('loaiPhuongTien', sql.NVarChar(50), loaiPhuongTien)
      .input('bienSo', sql.NVarChar(20), bienSo)
      .input('taiTrong', sql.Decimal(10, 2), taiTrong)
      .input('trangThai', sql.NVarChar(50), trangThai)
      .input('moTa', sql.NVarChar(500), moTa)
      .query(`
        UPDATE PhuongTien
        SET 
          LoaiPhuongTien = @loaiPhuongTien,
          BienSo = @bienSo,
          TaiTrong = @taiTrong,
          TrangThai = @trangThai,
          MoTa = @moTa
        WHERE PhuongTienID = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`${VEHICLE_SELECT_QUERY} WHERE PhuongTienID = @id`);

    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Lỗi cập nhật phương tiện', 
      error: err.message 
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM PhuongTien WHERE PhuongTienID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện để xóa' });
    }

    res.status(200).json({ message: 'Xóa phương tiện thành công' });
  } catch (err: any) {
    res.status(500).json({ 
      message: 'Lỗi khi xóa phương tiện', 
      error: err.message 
    });
  }
};