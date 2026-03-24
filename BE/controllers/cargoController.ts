import { Request, Response } from 'express';
import sql from 'mssql';
import { connectDB } from '../config/db';

const CARGO_SELECT_QUERY = `
  SELECT
    h.HangHoaID AS id,
    h.TenHang AS [desc],
    h.SoLuong AS qty,
    h.DonVi AS unit,
    ISNULL(c.SoContainer, '-') AS container, 
    h.ContainerID AS containerID,
    -- Phân loại hàng hiển thị trên cột 'Loại' ở FE
    CASE 
      WHEN h.TenHang LIKE N'%đông lạnh%' OR c.LoaiContainer = 'REEFER' THEN 'Reefer'
      WHEN h.TenHang LIKE N'%Linh kiện%' OR h.TenHang LIKE N'%OLED%' THEN 'Dangerous (DG)'
      ELSE 'General'
    END AS [type]
  FROM HangHoa h
  LEFT JOIN Container c ON h.ContainerID = c.ContainerID
`;

export const getAllCargo = async (_req: Request, res: Response) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`${CARGO_SELECT_QUERY} ORDER BY h.HangHoaID DESC`);
    res.status(200).json(result.recordset);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hàng hóa', error: err.message });
  }
};

export const createCargo = async (req: Request, res: Response) => {
  const { tenHang, soLuong, donVi, containerID } = req.body;
  try {
    const pool = await connectDB();
    const insertResult = await pool.request()
      .input('tenHang', sql.NVarChar(255), tenHang)
      .input('soLuong', sql.Decimal(10, 2), soLuong)
      .input('donVi', sql.NVarChar(50), donVi || 'Kiện')
      .input('containerID', sql.Int, containerID || null)
      .query(`
        INSERT INTO HangHoa (TenHang, SoLuong, DonVi, ContainerID)
        OUTPUT INSERTED.HangHoaID AS id
        VALUES (@tenHang, @soLuong, @donVi, @containerID)
      `);
    
    const newId = insertResult.recordset[0].id;
    const result = await pool.request()
      .input('id', sql.Int, newId)
      .query(`${CARGO_SELECT_QUERY} WHERE h.HangHoaID = @id`);
    
    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi tạo hàng hóa', error: err.message });
  }
};

export const updateCargo = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { tenHang, soLuong, donVi, containerID } = req.body;
  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.Int, id)
      .input('tenHang', sql.NVarChar(255), tenHang)
      .input('soLuong', sql.Decimal(10, 2), soLuong)
      .input('donVi', sql.NVarChar(50), donVi)
      .input('containerID', sql.Int, containerID || null)
      .query(`
        UPDATE HangHoa SET
          TenHang = ISNULL(@tenHang, TenHang),
          SoLuong = ISNULL(@soLuong, SoLuong),
          DonVi = ISNULL(@donVi, DonVi),
          ContainerID = @containerID
        WHERE HangHoaID = @id
      `);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`${CARGO_SELECT_QUERY} WHERE h.HangHoaID = @id`);
    
    res.status(200).json(result.recordset[0]);
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
  }
};

export const deleteCargo = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM HangHoa WHERE HangHoaID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hàng hóa để xóa' });
    }

    res.status(200).json({ message: 'Xóa hàng hóa thành công' });
  } catch (err: any) {
    res.status(500).json({ message: 'Lỗi khi xóa hàng hóa', error: err.message });
  }
};