# Node.js Modular Project Structure

## 📋 Tổng quan

Dự án Node.js được tổ chức theo kiến trúc modular (module-based architecture), giúp code dễ bảo trì, mở rộng và tái sử dụng.

## 🏗️ Cấu trúc thư mục

```
/src
|
|-- /config             # Cấu hình chung
|   |-- db.config.js    # Cấu hình database
|   |-- env.config.js   # Quản lý biến môi trường
|   `-- app.config.js   # Cấu hình ứng dụng
|
|-- /middleware         # Middleware toàn cục
|   |-- errorHandler.js # Xử lý lỗi global
|   |-- notFound.js     # Xử lý 404
|   `-- logger.js       # Logging middleware
|
|-- /utils              # Tiện ích chung
|   |-- helpers.js      # Hàm helper
|   |-- validators.js   # Validation utilities
|   `-- constants.js    # Các hằng số
|
|-- /modules            # Thư mục chính chứa các module
|   |
|   |-- /auth           # Module Authentication
|   |   |-- auth.controller.js   # Controller xử lý request/response
|   |   |-- auth.service.js      # Business logic
|   |   |-- auth.routes.js       # Định nghĩa routes
|   |   |-- auth.middleware.js   # Middleware riêng (checkRole, verifyToken)
|   |   `-- user.model.js        # Model User (Mongoose/Sequelize)
|   |
|   |-- /products       # Module Products
|   |   |-- products.controller.js
|   |   |-- products.service.js
|   |   |-- products.routes.js
|   |   `-- products.model.js
|   |
|   |-- /orders         # Module Orders
|   |   |-- orders.controller.js
|   |   |-- orders.service.js
|   |   |-- orders.routes.js
|   |   `-- orders.model.js
|   |
|   `-- index.js        # Tổng hợp tất cả routes của modules
|
`-- app.js              # Entry point của ứng dụng
```

## 📂 Chi tiết các thư mục

### `/config` - Cấu hình
Chứa các file cấu hình cho database, môi trường, và các thiết lập ứng dụng.

**Ví dụ:**
- `db.config.js`: Kết nối MongoDB, PostgreSQL, MySQL...
- `env.config.js`: Load và validate biến môi trường từ `.env`
- `app.config.js`: Port, CORS, API version...

### `/middleware` - Middleware toàn cục
Middleware áp dụng cho toàn bộ ứng dụng.

**Ví dụ:**
- `errorHandler.js`: Xử lý lỗi tập trung
- `notFound.js`: Xử lý route không tồn tại (404)
- `logger.js`: Ghi log request/response

### `/utils` - Tiện ích
Các hàm helper, utilities dùng chung.

**Ví dụ:**
- `helpers.js`: Hàm format date, generate ID...
- `validators.js`: Custom validation logic
- `constants.js`: Status codes, error messages...

### `/modules` - Các module chức năng

Mỗi module là một đơn vị chức năng độc lập, bao gồm:

#### **Controller** (`*.controller.js`)
- Xử lý HTTP request/response
- Gọi service để thực hiện business logic
- Trả về kết quả cho client

```javascript
// auth.controller.js
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
```

#### **Service** (`*.service.js`)
- Chứa business logic
- Tương tác với Model/Database
- Có thể gọi service khác nếu cần

```javascript
// auth.service.js
exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid password');
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return { token, user };
};
```

#### **Routes** (`*.routes.js`)
- Định nghĩa các endpoint
- Áp dụng middleware
- Kết nối với controller

```javascript
// auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

module.exports = router;
```

#### **Model** (`*.model.js`)
- Định nghĩa schema/structure của dữ liệu
- Tương tác với database

```javascript
// user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

module.exports = mongoose.model('User', userSchema);
```

#### **Middleware** (`*.middleware.js`)
- Middleware riêng cho module
- Ví dụ: xác thực, phân quyền

```javascript
// auth.middleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### `/modules/index.js` - Tổng hợp routes

File này import và export tất cả routes của các module.

```javascript
// modules/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth/auth.routes');
const productsRoutes = require('./products/products.routes');
const ordersRoutes = require('./orders/orders.routes');

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);

module.exports = router;
```

### `app.js` - Entry Point

File chính khởi tạo Express server.

```javascript
// app.js
const express = require('express');
const app = express();

// Middleware toàn cục
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Cấu hình
require('./config/db.config');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const routes = require('./modules');
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

## 🎯 Ưu điểm của cấu trúc này

### 1. **Tính module hóa cao**
- Mỗi module độc lập, dễ thêm/xóa
- Code được tổ chức theo chức năng, không phải theo loại file

### 2. **Dễ bảo trì và mở rộng**
- Thêm module mới không ảnh hưởng code cũ
- Tìm kiếm và sửa lỗi nhanh chóng

### 3. **Tái sử dụng code**
- Service có thể gọi lẫn nhau
- Utils và middleware dùng chung

### 4. **Separation of Concerns**
- Controller: Xử lý HTTP
- Service: Business logic
- Model: Data layer
- Middleware: Cross-cutting concerns

### 5. **Dễ test**
- Test từng layer độc lập
- Mock dependencies dễ dàng

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 2. Tạo file `.env`

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 3. Chạy ứng dụng

```bash
# Development
npm run dev

# Production
npm start
```

## 📝 Best Practices

1. **Đặt tên file nhất quán**: `module.type.js` (vd: `auth.controller.js`)
2. **Một file một trách nhiệm**: Controller chỉ xử lý HTTP, Service xử lý logic
3. **Async/await**: Sử dụng cho code bất đồng bộ
4. **Error handling**: Luôn có try-catch và middleware xử lý lỗi
5. **Validation**: Validate input ở controller trước khi gọi service
6. **Environment variables**: Không hardcode sensitive data
7. **Logging**: Log đầy đủ để debug
8. **Documentation**: Comment code phức tạp

## 🔧 Mở rộng

### Thêm module mới

1. Tạo thư mục trong `/modules`:
```bash
mkdir src/modules/payments
```

2. Tạo các file cần thiết:
```bash
touch src/modules/payments/payments.controller.js
touch src/modules/payments/payments.service.js
touch src/modules/payments/payments.routes.js
touch src/modules/payments/payments.model.js
```

3. Thêm route vào `modules/index.js`:
```javascript
const paymentsRoutes = require('./payments/payments.routes');
router.use('/payments', paymentsRoutes);
```

## 📚 Tài liệu tham khảo

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Architecture in Node.js](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📄 License

MIT

---

**Tác giả:** [Your Name]  
**Ngày tạo:** November 14, 2025
