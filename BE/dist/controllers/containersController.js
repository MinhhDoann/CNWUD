"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContainer = exports.updateContainer = exports.createContainer = exports.getAllContainers = void 0;
const db_1 = require("../config/db");
const mssql_1 = __importDefault(require("mssql"));
// Lấy danh sách container
const getAllContainers = async (req, res) => {
    try {
        const pool = await (0, db_1.connectDB)();
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
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi truy vấn database', error: err.message });
    }
};
exports.getAllContainers = getAllContainers;
// Tạo mới container
const createContainer = async (req, res) => {
    const { no, type, loc, status } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        await pool.request()
            .input('no', mssql_1.default.NVarChar, no)
            .input('type', mssql_1.default.NVarChar, type)
            .input('loc', mssql_1.default.NVarChar, loc)
            .input('status', mssql_1.default.NVarChar, status)
            .input('hopDongId', mssql_1.default.Int, 1) // Mặc định gán vào Hợp đồng số 1 để không lỗi FK
            .query(`
        INSERT INTO Container (SoContainer, LoaiContainer, ViTri, TrangThai, HopDongID)
        VALUES (@no, @type, @loc, @status, @hopDongId)
      `);
        res.status(201).json({ message: 'Thêm mới thành công' });
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi khi thêm container', error: err.message });
    }
};
exports.createContainer = createContainer;
// Cập nhật container
const updateContainer = async (req, res) => {
    const { id } = req.params;
    const { no, type, loc, status } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('no', mssql_1.default.NVarChar, no)
            .input('type', mssql_1.default.NVarChar, type)
            .input('loc', mssql_1.default.NVarChar, loc)
            .input('status', mssql_1.default.NVarChar, status)
            .query(`
        UPDATE Container 
        SET SoContainer = @no, 
            LoaiContainer = @type, 
            ViTri = @loc, 
            TrangThai = @status
        WHERE ContainerID = @id
      `);
        res.json({ message: 'Cập nhật thành công' });
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật', error: err.message });
    }
};
exports.updateContainer = updateContainer;
// Xóa container
const deleteContainer = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await (0, db_1.connectDB)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM Container WHERE ContainerID = @id');
        res.json({ message: 'Xóa thành công' });
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa container', error: err.message });
    }
};
exports.deleteContainer = deleteContainer;
