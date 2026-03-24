"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContainer = exports.updateContainer = exports.createContainer = exports.getAllContainers = void 0;
const db_1 = require("../config/db");
const mssql_1 = __importDefault(require("mssql"));
const CONTAINER_SELECT_QUERY = `
  SELECT 
    c.ContainerID AS id,
    ISNULL(c.SoContainer, 'CONT' + RIGHT('00000' + CAST(c.ContainerID AS VARCHAR(5)), 5)) AS no,
    c.LoaiContainer AS type,
    ISNULL(c.ViTri, N'Depot') AS loc, 
    ISNULL(c.TrangThai, N'Rỗng') AS status,
    c.TrongLuong AS weight,
    c.HopDongID AS hopDongID
  FROM Container c
`;
const getAllContainers = async (_req, res) => {
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request().query(`${CONTAINER_SELECT_QUERY} ORDER BY c.ContainerID DESC`);
        res.status(200).json(result.recordset);
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi lấy danh sách container', error: err.message });
    }
};
exports.getAllContainers = getAllContainers;
const createContainer = async (req, res) => {
    const { hopDongID = 1, no, type, weight = 0, status = 'Rỗng', loc = 'Depot' } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        const insertResult = await pool.request()
            .input('hopDongID', mssql_1.default.Int, hopDongID)
            .input('soContainer', mssql_1.default.NVarChar(50), no)
            .input('loaiContainer', mssql_1.default.NVarChar(20), type)
            .input('trongLuong', mssql_1.default.Decimal(10, 2), weight)
            .input('trangThai', mssql_1.default.NVarChar(50), status)
            .input('viTri', mssql_1.default.NVarChar(100), loc)
            .query(`
        INSERT INTO Container (HopDongID, SoContainer, LoaiContainer, TrongLuong, TrangThai, ViTri)
        OUTPUT INSERTED.ContainerID AS id
        VALUES (@hopDongID, @soContainer, @loaiContainer, @trongLuong, @trangThai, @viTri)
      `);
        const newId = insertResult.recordset[0].id;
        const result = await pool.request().input('id', mssql_1.default.Int, newId).query(`${CONTAINER_SELECT_QUERY} WHERE c.ContainerID = @id`);
        res.status(201).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi tạo container', error: err.message });
    }
};
exports.createContainer = createContainer;
const updateContainer = async (req, res) => {
    const id = Number(req.params.id);
    const { no, type, loc, status, weight } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('soContainer', mssql_1.default.NVarChar(50), no)
            .input('loaiContainer', mssql_1.default.NVarChar(20), type)
            .input('viTri', mssql_1.default.NVarChar(100), loc)
            .input('trangThai', mssql_1.default.NVarChar(50), status)
            .input('trongLuong', mssql_1.default.Decimal(10, 2), weight)
            .query(`
        UPDATE Container SET 
          SoContainer = ISNULL(@soContainer, SoContainer),
          LoaiContainer = ISNULL(@loaiContainer, LoaiContainer),
          ViTri = ISNULL(@viTri, ViTri),
          TrangThai = ISNULL(@trangThai, TrangThai),
          TrongLuong = ISNULL(@trongLuong, TrongLuong)
        WHERE ContainerID = @id
      `);
        const result = await pool.request().input('id', mssql_1.default.Int, id).query(`${CONTAINER_SELECT_QUERY} WHERE c.ContainerID = @id`);
        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
    }
};
exports.updateContainer = updateContainer;
const deleteContainer = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await (0, db_1.connectDB)();
        await pool.request().input('id', mssql_1.default.Int, id).query('DELETE FROM Container WHERE ContainerID = @id');
        res.status(200).json({ message: 'Xóa thành công' });
    }
    catch (err) {
        res.status(500).json({ message: 'Lỗi xóa', error: err.message });
    }
};
exports.deleteContainer = deleteContainer;
