"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCargo = exports.updateCargo = exports.createCargo = exports.getAllCargo = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
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
const getAllCargo = async (_req, res) => {
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request().query(`${CARGO_SELECT_QUERY} ORDER BY h.HangHoaID DESC`);
        res.status(200).json(result.recordset);
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi lấy danh sách hàng hóa', error: err.message });
    }
};
exports.getAllCargo = getAllCargo;
const createCargo = async (req, res) => {
    const { tenHang, soLuong, donVi, containerID } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        const insertResult = await pool.request()
            .input('tenHang', mssql_1.default.NVarChar(255), tenHang)
            .input('soLuong', mssql_1.default.Decimal(10, 2), soLuong)
            .input('donVi', mssql_1.default.NVarChar(50), donVi || 'Kiện')
            .input('containerID', mssql_1.default.Int, containerID || null)
            .query(`
        INSERT INTO HangHoa (TenHang, SoLuong, DonVi, ContainerID)
        OUTPUT INSERTED.HangHoaID AS id
        VALUES (@tenHang, @soLuong, @donVi, @containerID)
      `);
        const newId = insertResult.recordset[0].id;
        const result = await pool.request()
            .input('id', mssql_1.default.Int, newId)
            .query(`${CARGO_SELECT_QUERY} WHERE h.HangHoaID = @id`);
        res.status(201).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi tạo hàng hóa', error: err.message });
    }
};
exports.createCargo = createCargo;
const updateCargo = async (req, res) => {
    const id = Number(req.params.id);
    const { tenHang, soLuong, donVi, containerID } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('tenHang', mssql_1.default.NVarChar(255), tenHang)
            .input('soLuong', mssql_1.default.Decimal(10, 2), soLuong)
            .input('donVi', mssql_1.default.NVarChar(50), donVi)
            .input('containerID', mssql_1.default.Int, containerID || null)
            .query(`
        UPDATE HangHoa SET
          TenHang = ISNULL(@tenHang, TenHang),
          SoLuong = ISNULL(@soLuong, SoLuong),
          DonVi = ISNULL(@donVi, DonVi),
          ContainerID = @containerID
        WHERE HangHoaID = @id
      `);
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query(`${CARGO_SELECT_QUERY} WHERE h.HangHoaID = @id`);
        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
    }
};
exports.updateCargo = updateCargo;
const deleteCargo = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM HangHoa WHERE HangHoaID = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy hàng hóa để xóa' });
        }
        res.status(200).json({ message: 'Xóa hàng hóa thành công' });
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa hàng hóa', error: err.message });
    }
};
exports.deleteCargo = deleteCargo;
