"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransport = exports.updateTransport = exports.createTransport = exports.getAllTransports = void 0;
const mssql_1 = __importDefault(require("mssql"));
const db_1 = require("../config/db");
const TRANSPORT_SELECT_QUERY = `
  SELECT 
    c.ChuyenDiID AS id,
    c.MaChuyen AS ref,
    ISNULL(con.SoContainer, 'N/A') AS containerNo,
    con.ContainerID AS containerId,
    ISNULL(p.LoaiPhuongTien, 'Không xác định') AS vehicleType,
    ISNULL(p.BienSo, 'N/A') AS vehicleNo,
    FORMAT(c.NgayDuKienDen, 'yyyy-MM-dd') AS eta,
    ISNULL(c.TrangThai, N'Chuẩn bị') AS status
  FROM ChuyenDi c
  LEFT JOIN Container con ON c.ContainerID = con.ContainerID
  LEFT JOIN PhuongTien p ON c.PhuongTienID = p.PhuongTienID
`;
const getAllTransports = async (_req, res) => {
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request().query(`${TRANSPORT_SELECT_QUERY} ORDER BY c.ChuyenDiID DESC`);
        res.status(200).json(result.recordset);
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi lấy danh sách lịch trình vận tải',
            error: err.message
        });
    }
};
exports.getAllTransports = getAllTransports;
const createTransport = async (req, res) => {
    const { ref, containerId, vehicleId, eta } = req.body;
    if (!ref || !containerId || !vehicleId || !eta) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: ref, containerId, vehicleId, eta' });
    }
    try {
        const pool = await (0, db_1.connectDB)();
        const insertResult = await pool.request()
            .input('ref', mssql_1.default.NVarChar(50), ref)
            .input('containerId', mssql_1.default.Int, containerId)
            .input('vehicleId', mssql_1.default.Int, vehicleId)
            .input('eta', mssql_1.default.Date, eta)
            .query(`
        INSERT INTO ChuyenDi (MaChuyen, ContainerID, PhuongTienID, NgayDuKienDen, TrangThai)
        OUTPUT INSERTED.ChuyenDiID AS id
        VALUES (@ref, @containerId, @vehicleId, @eta, N'Chuẩn bị')
      `);
        const newId = insertResult.recordset[0].id;
        // Lấy lại bản ghi đầy đủ sau khi insert
        const result = await pool.request()
            .input('id', mssql_1.default.Int, newId)
            .query(`${TRANSPORT_SELECT_QUERY} WHERE c.ChuyenDiID = @id`);
        res.status(201).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi tạo lịch trình vận tải',
            error: err.message
        });
    }
};
exports.createTransport = createTransport;
const updateTransport = async (req, res) => {
    const id = Number(req.params.id);
    const { ref, containerId, vehicleId, eta, status } = req.body;
    try {
        const pool = await (0, db_1.connectDB)();
        // Kiểm tra tồn tại
        const existing = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('SELECT ChuyenDiID FROM ChuyenDi WHERE ChuyenDiID = @id');
        if (existing.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch trình vận tải' });
        }
        await pool.request()
            .input('id', mssql_1.default.Int, id)
            .input('ref', mssql_1.default.NVarChar(50), ref)
            .input('containerId', mssql_1.default.Int, containerId)
            .input('vehicleId', mssql_1.default.Int, vehicleId)
            .input('eta', mssql_1.default.Date, eta)
            .input('status', mssql_1.default.NVarChar(50), status)
            .query(`
        UPDATE ChuyenDi 
        SET 
          MaChuyen = ISNULL(@ref, MaChuyen),
          ContainerID = @containerId,
          PhuongTienID = @vehicleId,
          NgayDuKienDen = @eta,
          TrangThai = ISNULL(@status, TrangThai)
        WHERE ChuyenDiID = @id
      `);
        // Lấy lại dữ liệu sau khi update
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query(`${TRANSPORT_SELECT_QUERY} WHERE c.ChuyenDiID = @id`);
        res.status(200).json(result.recordset[0]);
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi cập nhật lịch trình vận tải',
            error: err.message
        });
    }
};
exports.updateTransport = updateTransport;
const deleteTransport = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const pool = await (0, db_1.connectDB)();
        const result = await pool.request()
            .input('id', mssql_1.default.Int, id)
            .query('DELETE FROM ChuyenDi WHERE ChuyenDiID = @id');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch trình để xóa' });
        }
        res.status(200).json({ message: 'Xóa lịch trình vận tải thành công' });
    }
    catch (err) {
        res.status(500).json({
            message: 'Lỗi khi xóa lịch trình vận tải',
            error: err.message
        });
    }
};
exports.deleteTransport = deleteTransport;
