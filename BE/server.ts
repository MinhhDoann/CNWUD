import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Backend is running',
  });
});

const loadRoutes = async () => {
  const routersPath = path.join(__dirname, 'routers');

  if (!fs.existsSync(routersPath)) {
    console.warn('Không tìm thấy thư mục routers');
    return;
  }

  const files = fs
    .readdirSync(routersPath)
    .filter((file) => {
      const ext = path.extname(file);
      const base = path.basename(file, ext);

      const isValidExt = ext === '.ts' || ext === '.js';
      const isNotIndex = base !== 'index';
      const isNotMap = !file.endsWith('.map');

      return isValidExt && isNotIndex && isNotMap;
    });

  for (const file of files) {
    const fullPath = path.join(routersPath, file);
    const routeName = path.basename(file, path.extname(file));

    try {
      const routeModule = await import(fullPath);
      const router = routeModule.default;

      if (!router) {
        console.warn(`File router "${file}" chưa export default`);
        continue;
      }

      app.use(`/api/${routeName}`, router);
      console.log(`Loaded route: /api/${routeName}`);
    } catch (error) {
      console.error(`Không thể load router ${file}:`, error);
    }
  }
};

const startServer = async () => {
  try {
    await connectDB();
    console.log('Kết nối database thành công');

    await loadRoutes();

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Khởi động server thất bại:', error);
    process.exit(1);
  }
};

startServer();