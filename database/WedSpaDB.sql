-- ====================================================================
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU WED-SPA TRÊN MICROSOFT SQL SERVER
-- Tương thích: SQL Server 2012, 2016, 2019, 2022, SQL Express
-- ====================================================================
-- 1. TẠO CƠ SỞ DỮ LIỆU NẾU CHƯA CÓ
IF NOT EXISTS (SELECT *
               FROM   sys.databases
               WHERE  name = 'WedSpaDB')
    BEGIN
        CREATE DATABASE WedSpaDB;
    END


GO
USE WedSpaDB;


GO
-- 2. XÓA CÁC BẢNG CŨ THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI (NẾU ĐÃ TỒN TẠI)
IF OBJECT_ID('Appointments', 'U') IS NOT NULL
    DROP TABLE Appointments;

IF OBJECT_ID('Services', 'U') IS NOT NULL
    DROP TABLE Services;

IF OBJECT_ID('Therapists', 'U') IS NOT NULL
    DROP TABLE Therapists;

IF OBJECT_ID('Vouchers', 'U') IS NOT NULL
    DROP TABLE Vouchers;

IF OBJECT_ID('Users', 'U') IS NOT NULL
    DROP TABLE Users;

IF OBJECT_ID('ContactMessages', 'U') IS NOT NULL
    DROP TABLE ContactMessages;

IF OBJECT_ID('Reviews', 'U') IS NOT NULL
    DROP TABLE Reviews;


GO
-- 3. BẢNG DỊCH VỤ SPA (Services)
CREATE TABLE Services (
    id          VARCHAR (20)    PRIMARY KEY,
    name        NVARCHAR (255)  NOT NULL,
    category    NVARCHAR (100)  NOT NULL,
    duration    INT             NOT NULL,
    price       DECIMAL (18, 0) NOT NULL,
    icon        VARCHAR (50)   ,
    description NVARCHAR (MAX) ,
    benefits    NVARCHAR (MAX) 
);

-- 4. BẢNG KỸ THUẬT VIÊN (Therapists)
CREATE TABLE Therapists (
    id         VARCHAR (20)   PRIMARY KEY,
    name       NVARCHAR (100) NOT NULL,
    title      NVARCHAR (255),
    icon       VARCHAR (50)  ,
    rating     FLOAT         ,
    experience NVARCHAR (50) ,
    specialty  NVARCHAR (MAX)
);

-- 5. BẢNG MÃ GIẢM GIÁ (Vouchers)
CREATE TABLE Vouchers (
    code        VARCHAR (50)    PRIMARY KEY,
    type        VARCHAR (20)    NOT NULL, -- 'percent' hoặc 'fixed'
    value       INT             NOT NULL,
    minOrder    DECIMAL (18, 0) DEFAULT 0,
    description NVARCHAR (255) ,
    isActive    BIT             DEFAULT 1
);

-- 6. BẢNG TÀI KHOẢN NGƯỜI DÙNG (Users)
CREATE TABLE Users (
    id        VARCHAR (50)   PRIMARY KEY,
    username  VARCHAR (100) ,
    email     VARCHAR (255) ,
    phone     VARCHAR (20)  ,
    fullName  NVARCHAR (150),
    password  VARCHAR (255)  NOT NULL,
    role      VARCHAR (20)   DEFAULT 'member', -- 'admin' hoặc 'member'
    createdAt DATETIME       DEFAULT GETDATE()
);

-- 7. BẢNG ĐƠN ĐẶT LỊCH HẸN (Appointments)
CREATE TABLE Appointments (
    id              VARCHAR (30)    PRIMARY KEY,
    customerName    NVARCHAR (150)  NOT NULL,
    customerPhone   VARCHAR (20)    NOT NULL,
    serviceId       VARCHAR (20)    FOREIGN KEY REFERENCES Services (id),
    therapistId     VARCHAR (20)   ,
    appointmentDate DATE            NOT NULL,
    appointmentTime VARCHAR (10)    NOT NULL,
    originalPrice   DECIMAL (18, 0) NOT NULL,
    voucherCode     VARCHAR (50)   ,
    discountAmount  DECIMAL (18, 0) DEFAULT 0,
    finalPrice      DECIMAL (18, 0) NOT NULL,
    paymentMethod   VARCHAR (20)    DEFAULT 'cash',
    status          VARCHAR (20)    DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    notes           NVARCHAR (MAX) ,
    createdAt       DATETIME        DEFAULT GETDATE()
);

-- 8. BẢNG TIN NHẮN TƯ VẤN & LIÊN HỆ (ContactMessages)
CREATE TABLE ContactMessages (
    id        INT            IDENTITY (1, 1) PRIMARY KEY,
    name      NVARCHAR (150) NOT NULL,
    phone     VARCHAR (20)   NOT NULL,
    email     VARCHAR (255) ,
    subject   NVARCHAR (255),
    message   NVARCHAR (MAX),
    createdAt DATETIME       DEFAULT GETDATE()
);

-- 9. BẢNG ĐÁNH GIÁ (Reviews)
CREATE TABLE Reviews (
    id        INT            IDENTITY (1, 1) PRIMARY KEY,
    author    NVARCHAR (150) NOT NULL,
    role      NVARCHAR (100),
    rating    INT            DEFAULT 5,
    comment   NVARCHAR (MAX),
    createdAt DATETIME       DEFAULT GETDATE()
);


GO
-- ====================================================================
-- CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA KHỚP VỚI GIAO DIỆN WEB)
-- ====================================================================
-- 1. DỮ LIỆU DỊCH VỤ
INSERT  INTO Services (
    id,
    name,
    category,
    duration,
    price,
    icon,
    description,
    benefits
)
VALUES                ('ser-1', N'Massage Body Đá Nóng', N'Massage Trị Liệu', 60, 390000, 'fa-hot-tub-person', N'Sử dụng đá bazan núi lửa tự nhiên giúp đả thông kinh lạc, giảm đau nhức xương khớp và phục hồi sinh lực sau ngày dài mệt mỏi.', N'Đả thông khí huyết,Giảm căng thẳng cơ bắp,Cải thiện giấc ngủ'),
                      ('ser-2', N'Chăm Sóc Da Mặt Chuyên Sâu', N'Chăm Sóc Da', 75, 450000, 'fa-wand-magic-sparkles', N'Liệu trình cấp ẩm đa tầng, thải độc chì và điện di tinh chất collagen tái sinh làn da mịn màng, căng bóng tự nhiên.', N'Cấp ẩm tầng sâu,Thải độc & sáng da,Trẻ hóa tế bào da'),
                      ('ser-3', N'Gội Đầu Dưỡng Sinh Thảo Dược', N'Dưỡng Sinh', 60, 280000, 'fa-pump-soap', N'Massage bấm huyệt vùng đầu, cổ vai gáy kết hợp canh thảo dược bồ kết cô đặc giúp ngủ sâu giấc, thư giãn mắt và giảm rụng tóc.', N'Thư giãn hệ thần kinh,Lưu thông máu não,Chăm sóc tóc tự nhiên'),
                      ('ser-4', N'Trị Liệu Cổ Vai Gáy Chuyên Biệt', N'Trị Liệu Chuyên Sâu', 45, 320000, 'fa-hand-holding-heart', N'Liệu pháp đặc trị cho dân văn phòng, xua tan căng cứng cơ, đau đầu co thắt và tê bì vùng bả vai bằng ngải cứu ấm.', N'Giải phóng điểm chèn ép,Hết tê mỏi bả vai,Tăng biên độ cổ vai'),
                      ('ser-5', N'Tẩy Tế Bào Chết Toàn Thân & Tắm Thảo Mộc', N'Chăm Sóc Toàn Thân', 50, 350000, 'fa-shower', N'Tẩy da chết bằng bột cà phê hữu cơ kết hợp sữa chua, sau đó ngâm bồn thảo dược ngải diệp giúp da sáng khỏe mềm mịn.', N'Tẩy sạch sừng già,Da mịn màng bật tông,Thải độc lỗ chân lông'),
                      ('ser-6', N'Massage Bấm Huyệt Bàn Chân (Foot Spa)', N'Massage Trị Liệu', 45, 250000, 'fa-shoe-prints', N'Ngâm chân nước muối hồng Himalaya kết hợp bấm huyệt phản xạ lòng bàn chân giúp điều hòa tạng phủ và giảm tê phù.', N'Kích thích huyệt đạo,Giảm nhức mỏi chân,Tăng tuần hoàn chi dưới');

-- 2. DỮ LIỆU KỸ THUẬT VIÊN
INSERT  INTO Therapists (
    id,
    name,
    title,
    icon,
    rating,
    experience,
    specialty
)
VALUES                  ('ther-1', N'Nguyễn Lan Anh', N'Chuyên Viên Trị Liệu Cổ Vai Gáy', 'fa-user-nurse', 4.9, N'5 năm kinh nghiệm', N'Bấm huyệt đả thông kinh lạc, trị liệu vùng lưng & cổ vai'),
                        ('ther-2', N'Trần Thu Trang', N'Kỹ Thuật Viên Chăm Sóc Da (Facial)', 'fa-wand-magic-sparkles', 4.95, N'4 năm kinh nghiệm', N'Điện di tinh chất tái sinh da, phục hồi màng ẩm chuyên sâu'),
                        ('ther-3', N'Lê Minh Hạnh', N'Chuyên Gia Dưỡng Sinh & Huyệt Đạo', 'fa-spa', 4.88, N'6 năm kinh nghiệm', N'Gội đầu dưỡng sinh Trung Hoa, bấm huyệt tiền đình ngủ ngon'),
                        ('ther-4', N'Phạm Ngọc Bích', N'Chuyên Viên Massage Thư Giãn Toàn Thân', 'fa-hands-holding-circle', 4.92, N'3 năm kinh nghiệm', N'Massage đá núi lửa, tinh dầu hương thảo & thụy điển');

-- 3. DỮ LIỆU MÃ GIẢM GIÁ
INSERT  INTO Vouchers (
    code,
    type,
    value,
    minOrder,
    description,
    isActive
)
VALUES                ('SPA10', 'percent', 10, 0, N'Giảm 10% tổng hóa đơn cho mọi khách hàng', 1),
                      ('RELAX50', 'fixed', 50000, 300000, N'Giảm ngay 50.000 ₫ cho hóa đơn từ 300.000 ₫', 1),
                      ('VIP20', 'percent', 20, 500000, N'Ưu đãi tri ân giảm 20% cho đơn từ 500.000 ₫', 1);

-- 4. DỮ LIỆU TÀI KHOẢN NGƯỜI DÙNG (ADMIN & KHÁCH HÀNG)
INSERT  INTO Users (
    id,
    username,
    email,
    phone,
    fullName,
    password,
    role
)
VALUES             ('u-admin', 'admin', 'admin@wedspa.vn', '0900000000', N'Quản Trị Viên Spa', 'admin123', 'admin'),
                   ('u-member-1', 'maianh', 'maianh@gmail.com', '0912345678', N'Trần Mai Anh', '123456', 'member'),
                   ('u-member-2', 'hoangnam', 'hoangnam@gmail.com', '0987654321', N'Lê Hoàng Nam', '123456', 'member');

-- 5. DỮ LIỆU LỊCH HẸN MẪU
INSERT  INTO Appointments (
    id,
    customerName,
    customerPhone,
    serviceId,
    therapistId,
    appointmentDate,
    appointmentTime,
    originalPrice,
    voucherCode,
    discountAmount,
    finalPrice,
    paymentMethod,
    status,
    notes
)
VALUES                    ('SPA-1001', N'Trần Mai Anh', '0912345678', 'ser-1', 'ther-1', CAST (GETDATE() AS DATE), '09:30', 390000, 'SPA10', 39000, 351000, 'cash', 'confirmed', N'Khách thích massage lực vừa, tinh dầu oải hương thư giãn'),
                          ('SPA-1002', N'Lê Hoàng Nam', '0987654321', 'ser-4', 'ther-4', CAST (GETDATE() AS DATE), '14:00', 320000, '', 0, 320000, 'banking', 'pending', N'Làm êm tay giúp mình, vùng cổ vai đang hơi nhức mỏi'),
                          ('SPA-1003', N'Nguyễn Thu Hà', '0905123456', 'ser-2', 'ther-2', CAST (GETDATE() AS DATE), '10:30', 450000, 'RELAX50', 50000, 400000, 'cash', 'confirmed', N'Chăm sóc da mặt chuyên sâu, da hơi nhạy cảm'),
                          ('SPA-1004', N'Phạm Minh Đức', '0918888999', 'ser-3', 'ther-3', CAST (GETDATE() AS DATE), '16:00', 280000, '', 0, 280000, 'cash', 'completed', N'Gội đầu canh thuốc dưỡng sinh, đã thanh toán tại quầy');

-- 6. DỮ LIỆU ĐÁNH GIÁ (Reviews)
INSERT  INTO Reviews (
    author,
    role,
    rating,
    comment
)
VALUES               (N'Trần Mai Anh', N'Khách hàng thân thiết', 5, N'Kỹ thuật viên Lan Anh bấm huyệt cổ vai gáy rất êm tay. Mình làm văn phòng ngồi nhiều bị mỏi, làm xong 1 buổi nhẹ nhõm hẳn.'),
                     (N'Lê Hoàng Nam', N'Khách hàng mới', 5, N'Đặt lịch trên web siêu nhanh, không cần đăng ký tài khoản rườm rà. Đến nơi có sẵn phòng không phải ngồi chờ phút nào!'),
                     (N'Nguyễn Thu Hà', N'Khách hàng thân thiết', 5, N'Gói gội đầu dưỡng sinh thơm mùi bồ kết thảo dược tự nhiên, phòng sạch sẽ, nhạc thiền êm ái ngủ quên luôn.');


GO
-- KIỂM TRA DỮ LIỆU ĐÃ TẠO THÀNH CÔNG
SELECT 'Services' AS TableName,
       COUNT(*) AS TotalRows
FROM   Services
UNION ALL
SELECT 'Therapists',
       COUNT(*)
FROM   Therapists
UNION ALL
SELECT 'Appointments',
       COUNT(*)
FROM   Appointments
UNION ALL
SELECT 'Vouchers',
       COUNT(*)
FROM   Vouchers
UNION ALL
SELECT 'Users',
       COUNT(*)
FROM   Users;