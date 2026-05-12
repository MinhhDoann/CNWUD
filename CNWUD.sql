CREATE DATABASE CNWUD;
GO
USE CNWUD;
GO

-- 1. Khách hàng & Đối tác
CREATE TABLE KhachHang (
    KhachHangID INT IDENTITY(1,1) PRIMARY KEY,
    TenKH NVARCHAR(150) NOT NULL,
    DiaChi NVARCHAR(200),
    SDT NVARCHAR(20),
    Email NVARCHAR(100),
    LoaiDoiTac NVARCHAR(50) DEFAULT N'Khách hàng',
    TrangThai NVARCHAR(50) DEFAULT N'Hoạt động'
);

-- 2. Nhân sự (Staff)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    HoTen NVARCHAR(100),
    Email NVARCHAR(100),
    TrangThai NVARCHAR(50) DEFAULT N'Hoạt động'
);

-- 3. Phương tiện
CREATE TABLE PhuongTien (
    PhuongTienID INT IDENTITY(1,1) PRIMARY KEY,
    LoaiPhuongTien NVARCHAR(50),
    BienSo NVARCHAR(20),
    TaiTrong DECIMAL(10,2),
    TrangThai NVARCHAR(50) DEFAULT N'Sẵn sàng',
    MoTa NVARCHAR(500)
);

-- 4. Hợp đồng
CREATE TABLE HopDong (
    HopDongID INT IDENTITY(1,1) PRIMARY KEY,
    SoHopDong NVARCHAR(50) UNIQUE NOT NULL,
    KhachHangID INT NOT NULL,
    NgayKy DATE NOT NULL,
    NgayHetHan DATE,
    LoaiDichVu NVARCHAR(100),
    GiaTri DECIMAL(15,2) DEFAULT 0,
    TrangThai NVARCHAR(50) DEFAULT N'Chờ ký',
    GhiChu NVARCHAR(500),
    FOREIGN KEY (KhachHangID) REFERENCES KhachHang(KhachHangID)
);

-- 5. Container (Đã sửa đổi: Thay LoaiHangID bằng LoaiContainer)
CREATE TABLE Container (
    ContainerID INT IDENTITY(1,1) PRIMARY KEY,
    HopDongID INT NOT NULL,
    SoContainer NVARCHAR(50) UNIQUE, -- Số hiệu container thực tế
    LoaiContainer NVARCHAR(20) NOT NULL, -- Sẽ lưu: 20DC, 40HC, REEFER, OPEN_TOP
    TrongLuong DECIMAL(10,2) DEFAULT 0,
    TrangThai NVARCHAR(50) DEFAULT N'Rỗng',
    ViTri NVARCHAR(100) DEFAULT N'Depot', -- Depot, Port, Onboard
    PhuongTienID INT NULL,
    FOREIGN KEY (HopDongID) REFERENCES HopDong(HopDongID),
    FOREIGN KEY (PhuongTienID) REFERENCES PhuongTien(PhuongTienID)
);

-- 6. Hàng hóa (Cargo) - Lưu loại hàng thực tế bên trong container
CREATE TABLE HangHoa (
    HangHoaID INT IDENTITY(1,1) PRIMARY KEY,
    TenHang NVARCHAR(255) NOT NULL,
    ContainerID INT NULL,
    SoLuong DECIMAL(10,2) DEFAULT 0,
    DonVi NVARCHAR(50),
    FOREIGN KEY (ContainerID) REFERENCES Container(ContainerID)
);

-- 7. Chuyến đi / Vận tải
CREATE TABLE ChuyenDi (
    ChuyenDiID INT IDENTITY(1,1) PRIMARY KEY,
    MaChuyen NVARCHAR(50) UNIQUE NOT NULL,
    ContainerID INT NULL,
    PhuongTienID INT NULL,
    NgayKhoiHanh DATE,
    NgayDuKienDen DATE,
    TrangThai NVARCHAR(50) DEFAULT N'Chuẩn bị',
    FOREIGN KEY (ContainerID) REFERENCES Container(ContainerID),
    FOREIGN KEY (PhuongTienID) REFERENCES PhuongTien(PhuongTienID)
);

-- 8. Chi phí
CREATE TABLE ChiPhi (
    ChiPhiID INT IDENTITY(1,1) PRIMARY KEY,
    ContainerID INT NOT NULL,
    LoaiChiPhi NVARCHAR(100),
    SoTien DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (ContainerID) REFERENCES Container(ContainerID)
);

-- 9. Hóa đơn
CREATE TABLE HoaDon (
    HoaDonID INT IDENTITY(1,1) PRIMARY KEY,
    HopDongID INT NOT NULL,
    SoHoaDon NVARCHAR(50) UNIQUE,
    NgayLap DATE,
    NgayHetHan DATE,
    TongTien DECIMAL(15,2) DEFAULT 0,
    VAT DECIMAL(5,2) DEFAULT 0,
    TrangThai NVARCHAR(50) DEFAULT N'Chưa thanh toán',
    GhiChu NVARCHAR(500),
    FOREIGN KEY (HopDongID) REFERENCES HopDong(HopDongID)
);

USE CNWUD;
GO

-- 1. Khách hàng & Đối tác (5 bản ghi)
INSERT INTO KhachHang (TenKH, DiaChi, SDT, Email, LoaiDoiTac, TrangThai) VALUES 
(N'Công ty Samsung VN', N'KCN Yên Phong, Bắc Ninh', '0241345678', 'logistics@samsung.com', N'Khách hàng', N'Hoạt động'),
(N'Tổng kho Masan', N'Quận 1, TP.HCM', '0283899112', 'supply@masan.vn', N'Khách hàng', N'Hoạt động'),
(N'Hòa Phát Group', N'KCN Phố Nối, Hưng Yên', '0221390090', 'shipping@hoaphat.com.vn', N'Đối tác', N'Hoạt động'),
(N'Logistics Xuyên Việt', N'Quận Hải An, Hải Phòng', '0225366788', 'contact@xuyenviet.vn', N'Đối tác', N'Hoạt động'),
(N'Siêu thị Aeon Mall', N'Long Biên, Hà Nội', '0243987654', 'aeon_log@aeon.com.vn', N'Khách hàng', N'Hoạt động');

-- 2. Nhân sự (5 bản ghi)
INSERT INTO Users (Username, PasswordHash, HoTen, Email, TrangThai) VALUES 
('admin', '123', N'Nguyễn Văn Admin', 'admin@system.com', N'Hoạt động'),
('staff_linh', '123', N'Trần Thị Linh', 'linh.tt@gmail.com', N'Hoạt động'),
('staff_hung', '123', N'Lê Văn Hùng', 'hung.lv@gmail.com', N'Hoạt động'),
('driver_nam', '123', N'Lê Hoàng Nam', 'nam.lh@gmail.com', N'Hoạt động'),
('driver_tu', '123', N'Phạm Anh Tú', 'tu.pa@gmail.com', N'Hoạt động');

-- 3. Phương tiện (5 bản ghi)
INSERT INTO PhuongTien (LoaiPhuongTien, BienSo, TaiTrong, TrangThai, MoTa) VALUES 
(N'Xe đầu kéo', '29H-123.45', 30.00, N'Sẵn sàng', N'Xe Freightliner Cascadia'),
(N'Xe đầu kéo', '15C-678.90', 35.00, N'Đang đi giao', N'Xe Hyundai Xcient'),
(N'Xe tải 10 tấn', '51D-999.22', 10.00, N'Bảo trì', N'Xe Isuzu FVR'),
(N'Xe đầu kéo', '34C-111.22', 32.00, N'Sẵn sàng', N'Xe Hino 700'),
(N'Xe đầu kéo', '43H-555.66', 30.00, N'Sẵn sàng', N'Xe Chenglong H7');

-- 4. Hợp đồng (5 bản ghi)
INSERT INTO HopDong (SoHopDong, KhachHangID, NgayKy, NgayHetHan, LoaiDichVu, GiaTri, TrangThai) VALUES 
('HD-2025-001', 1, '2025-01-10', '2026-01-10', N'Vận chuyển & Lưu kho', 500000000, N'Đã ký'),
('HD-2025-002', 2, '2025-02-15', '2025-08-15', N'Vận tải nội địa', 250000000, N'Đã ký'),
('HD-2025-003', 3, '2025-03-01', '2026-03-01', N'Vận chuyển quốc tế', 1200000000, N'Chờ ký'),
('HD-2025-004', 5, '2025-01-05', '2025-07-05', N'Giao hàng chặng cuối', 150000000, N'Đã ký'),
('HD-2025-005', 4, '2025-03-20', '2025-12-20', N'Ủy thác xuất nhập khẩu', 800000000, N'Chờ ký');

-- 5. Container (5 bản ghi - Khớp với yêu cầu 20DC, 40HC, REEFER...)
INSERT INTO Container (HopDongID, SoContainer, LoaiContainer, TrongLuong, TrangThai, ViTri, PhuongTienID) VALUES 
(1, 'MSCU778899', '20DC', 20.5, N'Đầy hàng', N'Port', 1),
(1, 'MAEU112233', '40HC', 18.0, N'Rỗng', N'Depot', NULL),
(2, 'REEF445566', 'REEFER', 15.2, N'Đang vận chuyển', N'Onboard', 2),
(4, 'TEXU334455', 'OPEN_TOP', 25.0, N'Đầy hàng', N'Port', NULL),
(2, 'SUDU556677', '20DC', 12.0, N'Bảo trì', N'Depot', NULL);

-- 6. Hàng hóa (5 bản ghi)
INSERT INTO HangHoa (TenHang, ContainerID, SoLuong, DonVi) VALUES 
(N'Màn hình Samsung OLED', 1, 500, N'Chiếc'),
(N'Linh kiện điện tử', 1, 1200, N'Kiện'),
(N'Sữa bột đặc Masan', 3, 2000, N'Thùng'),
(N'Vải cuộn may mặc', 4, 50, N'Cuộn'),
(N'Thực phẩm đông lạnh', 3, 10, N'Tấn');

-- 7. Chuyến đi / Vận tải (5 bản ghi)
INSERT INTO ChuyenDi (MaChuyen, ContainerID, PhuongTienID, NgayKhoiHanh, NgayDuKienDen, TrangThai) VALUES 
('TRIP-2025-001', 1, 1, '2025-03-20', '2025-03-22', N'Đang đi'),
('TRIP-2025-002', 3, 2, '2025-03-21', '2025-03-23', N'Đang đi'),
('TRIP-2025-003', 2, NULL, '2025-03-25', '2025-03-26', N'Chuẩn bị'),
('TRIP-2025-004', 4, 4, '2025-03-18', '2025-03-19', N'Hoàn thành'),
('TRIP-2025-005', 5, NULL, '2025-04-01', '2025-04-03', N'Chuẩn bị');

-- 8. Chi phí (5 bản ghi)
INSERT INTO ChiPhi (ContainerID, LoaiChiPhi, SoTien) VALUES 
(1, N'Phí nâng hạ cảng', 550000),
(1, N'Cước vận tải đường bộ', 4500000),
(3, N'Phí cắm điện container lạnh', 1200000),
(2, N'Phí lưu bãi (DEM)', 300000),
(4, N'Phí bạt che hàng quá khổ', 800000);

-- 9. Hóa đơn (5 bản ghi)
INSERT INTO HoaDon (HopDongID, SoHoaDon, NgayLap, NgayHetHan, TongTien, VAT, TrangThai) VALUES 
(1, 'INV25-001', '2025-03-01', '2025-03-15', 55000000, 10, N'Đã thanh toán'),
(2, 'INV25-002', '2025-03-05', '2025-03-20', 25000000, 10, N'Chưa thanh toán'),
(1, 'INV25-003', '2025-03-10', '2025-03-25', 12000000, 10, N'Đã thanh toán'),
(4, 'INV25-004', '2025-03-22', '2025-04-05', 45000000, 10, N'Quá hạn'),
(2, 'INV25-005', '2025-03-24', '2025-04-10', 30000000, 10, N'Chưa thanh toán');