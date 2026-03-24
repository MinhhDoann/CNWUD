"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'Backend is running',
    });
});
const loadRoutes = async () => {
    const routersPath = path_1.default.join(__dirname, 'routers');
    if (!fs_1.default.existsSync(routersPath)) {
        console.warn('Không tìm thấy thư mục routers');
        return;
    }
    const files = fs_1.default
        .readdirSync(routersPath)
        .filter((file) => {
        const ext = path_1.default.extname(file);
        const base = path_1.default.basename(file, ext);
        const isValidExt = ext === '.ts' || ext === '.js';
        const isNotIndex = base !== 'index';
        const isNotMap = !file.endsWith('.map');
        return isValidExt && isNotIndex && isNotMap;
    });
    for (const file of files) {
        const fullPath = path_1.default.join(routersPath, file);
        const routeName = path_1.default.basename(file, path_1.default.extname(file));
        try {
            const routeModule = await Promise.resolve(`${fullPath}`).then(s => __importStar(require(s)));
            const router = routeModule.default;
            if (!router) {
                console.warn(`File router "${file}" chưa export default`);
                continue;
            }
            app.use(`/api/${routeName}`, router);
            console.log(`Loaded route: /api/${routeName}`);
        }
        catch (error) {
            console.error(`Không thể load router ${file}:`, error);
        }
    }
};
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        console.log('Kết nối database thành công');
        await loadRoutes();
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Khởi động server thất bại:', error);
        process.exit(1);
    }
};
startServer();
