import sql from 'mssql';

const config: sql.config = {
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

let pool: sql.ConnectionPool | null = null;

export const connectDB = async (): Promise<sql.ConnectionPool> => {
  if (pool && pool.connected) return pool;

  try {
    console.log('Đang kết nối SQL Server...');
    pool = await sql.connect(config);
    console.log('Kết nối SQL Server thành công!');
    return pool;
  } catch (error) {
    console.error('Lỗi kết nối SQL Server:', error);
    throw error;
  }
};