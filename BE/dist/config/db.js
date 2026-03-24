"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config = {
    server: 'DESKTOP-IDO3K8B',
    port: 1433,
    database: 'CNWUD',
    authentication: {
        type: 'ntlm',
        options: {
            domain: 'DESKTOP-IDO3K8B',
            userName: 'Lenovo',
            password: '160820',
        },
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
};
let pool = null;
const connectDB = async () => {
    if (pool && pool.connected)
        return pool;
    try {
        console.log('Đang kết nối SQL Server...');
        pool = await mssql_1.default.connect(config);
        console.log('Kết nối SQL Server thành công!');
        return pool;
    }
    catch (error) {
        console.error('Lỗi kết nối SQL Server:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
