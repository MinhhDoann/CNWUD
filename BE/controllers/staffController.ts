// staffController.ts
import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const STAFF_SELECT_QUERY = `
  SELECT 
    UserID AS id,
    Username AS username,
    HoTen AS fullName,
    Email AS email,
    TrangThai AS status
  FROM Users
`;

export const getAllStaff = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`${STAFF_SELECT_QUERY} ORDER BY UserID DESC`);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    console.error('getAllStaff error:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách nhân sự', error: err.message });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  const { username, hoTen, email, trangThai = 'Hoạt động' } = req.body;

  if (!username || !hoTen) {
    return res.status(400).json({ message: 'Thiếu username hoặc họ tên' });
  }

  try {
    const pool = await connectDB();

    const insertResult = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .input('hoTen', sql.NVarChar(100), hoTen)
      .input('email', sql.NVarChar(100), email || null)
      .input('trangThai', sql.NVarChar(50), trangThai)
      .query(`
        INSERT INTO Users (Username, PasswordHash, HoTen, Email, TrangThai)
        OUTPUT INSERTED.UserID AS id
        VALUES (@username, '123', @hoTen, @email, @trangThai)
      `);

    const newId = insertResult.recordset[0].id;

    const result = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${STAFF_SELECT_QUERY} WHERE UserID = @id`);

    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    console.error('createStaff error:', err);
    res.status(500).json({ message: 'Lỗi tạo nhân sự', error: err.message });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { username, hoTen, email, trangThai } = req.body;

  try {
    const pool = await connectDB();

    const existing = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT UserID FROM Users WHERE UserID = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân sự' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('username', sql.NVarChar(50), username)
      .input('hoTen', sql.NVarChar(100), hoTen)
      .input('email', sql.NVarChar(100), email)
      .input('trangThai', sql.NVarChar(50), trangThai)
      .query(`
        UPDATE Users
        SET 
          Username = @username,
          HoTen = @hoTen,
          Email = @email,
          TrangThai = @trangThai
        WHERE UserID = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`${STAFF_SELECT_QUERY} WHERE UserID = @id`);

    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    console.error('updateStaff error:', err);
    res.status(500).json({ message: 'Lỗi cập nhật nhân sự', error: err.message });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Users WHERE UserID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân sự để xóa' });
    }

    res.status(200).json({ message: 'Xóa nhân sự thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi xóa nhân sự', error: err.message });
  }
};