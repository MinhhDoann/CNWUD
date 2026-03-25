"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getAllVehicles = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
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
const getAllVehicles = async (_req, res) => {
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request().query(`${VEHICLE_SELECT_QUERY} ORDER BY PhuongTienID DESC`);
        res.status(200).json(result.recordset);
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi lấy danh sách phương tiện',
            error: err.message
        });
    }
};
exports.getAllVehicles = getAllVehicles;
const createVehicle = async (req, res) => {
    const { loaiPhuongTien, bienSo, taiTrong, trangThai, moTa } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        const insertResult = await pool.request()
            .input('loaiPhuongTien', mssql_1.default.NVarChar(50), loaiPhuongTien)
            .input('bienSo', mssql_1.default.NVarChar(20), bienSo)
            .input('taiTrong', mssql_1.default.Decimal(10, 2), taiTrong || 0)
            .input('trangThai', mssql_1.default.NVarChar(50), trangThai || 'Sẵn sàng')
            .input('moTa', mssql_1.default.NVarChar(500), moTa || null)
            .query(`
        INSERT INTO PhuongTien (LoaiPhuongTien, BienSo, TaiTrong, TrangThai, MoTa)
        OUTPUT INSERTED.PhuongTienID
        VALUES (@loaiPhuongTien, @bienSo, @taiTrong, @trangThai, @moTa)
      `);
        const newId = insertResult.recordset[0].PhuongTienID;
        const result = await pool.request()
            .input('id', mssql_1.default.Int, newId)
            .query(`${VEHICLE_SELECT_QUERY} WHERE PhuongTienID = @id`);
        res.status(201).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi tạo phương tiện',
            error: err.message
        });
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res) => {
    const id = Number(req.params.id);
    const { loaiPhuongTien, bienSo, taiTrong, trangThai, moTa } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        const existing = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT PhuongTienID FROM PhuongTien WHERE PhuongTienID = @id');
        if (existing.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
        }
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('loaiPhuongTien', mssql_1.default.NVarChar(50), loaiPhuongTien)
            .input('bienSo', mssql_1.default.NVarChar(20), bienSo)
            .input('taiTrong', mssql_1.default.Decimal(10, 2), taiTrong)
            .input('trangThai', mssql_1.default.NVarChar(50), trangThai)
            .input('moTa', mssql_1.default.NVarChar(500), moTa)
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
            .input('id', mssql_1.default.Int, id)
            .query(`${VEHICLE_SELECT_QUERY} WHERE PhuongTienID = @id`);
        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi cập nhật phương tiện',
            error: err.message
        });
    }
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM PhuongTien WHERE PhuongTienID = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phương tiện để xóa' });
        }
        res.status(200).json({ message: 'Xóa phương tiện thành công' });
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi khi xóa phương tiện',
            error: err.message
        });
    }
};
exports.deleteVehicle = deleteVehicle;
