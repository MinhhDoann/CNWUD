import { Request, Response } from 'express';
import { connectDB } from '../config/db';
import sql from 'mssql';

// Lấy danh sách container
export const getAllContainers = async (req: Request, res: Response) => {
  try {
    const pool = await connectDB() ;
    const result = await pool.request().query(`
      SELECT 
        ContainerID as id, 
        SoContainer as no, 
        LoaiContainer as type, 
        ViTri as loc, 
        TrangThai as status 
      FROM Container
    `);
    res.json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi truy vấn database', error: err.message });
  }
};

// Tạo mới container
export const createContainer = async (req: Request, res: Response) => {
  const { no, type, loc, status } = req.body;
  try {
    const pool = await connectDB() ;
    await pool.request()
      .input('no', sql.NVarChar, no)
      .input('type', sql.NVarChar, type)
      .input('loc', sql.NVarChar, loc)
      .input('status', sql.NVarChar, status)
      .input('hopDongId', sql.Int, 1) // Mặc định gán vào Hợp đồng số 1 để không lỗi FK
      .query(`
        INSERT INTO Container (SoContainer, LoaiContainer, ViTri, TrangThai, HopDongID)
        VALUES (@no, @type, @loc, @status, @hopDongId)
      `);
    res.status(201).json({ message: 'Thêm mới thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi thêm container', error: err.message });
  }
};

// Cập nhật container
export const updateContainer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { no, type, loc, status } = req.body;
  try {
    const pool = await connectDB() ;
    await pool.request()
      .input('id', sql.Int, id)
      .input('no', sql.NVarChar, no)
      .input('type', sql.NVarChar, type)
      .input('loc', sql.NVarChar, loc)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Container 
        SET SoContainer = @no, 
            LoaiContainer = @type, 
            ViTri = @loc, 
            TrangThai = @status
        WHERE ContainerID = @id
      `);
    res.json({ message: 'Cập nhật thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: err.message });
  }
};

// Xóa container
export const deleteContainer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const pool = await connectDB() ;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Container WHERE ContainerID = @id');
    res.json({ message: 'Xóa thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi xóa container', error: err.message });
  }
};