# 🎓 TOEIC Preparation Platform with AI (Monorepo)

Nền tảng luyện thi TOEIC thích ứng (Adaptive Learning) tích hợp AI, được xây dựng theo kiến trúc Monorepo hiện đại.

---

## 🏗️ Cấu Trúc Dự Án (Project Structure)

```
ProjectTOEIC/
├── frontend/                   # Next.js 16 (App Router, Tailwind CSS, TypeScript)
│   ├── docs/                   # Tài liệu Requirements & Architecture
│   └── src/
│       └── app/                # Pages, layouts, UI components
├── backend/                    # NestJS 12 (Modular Clean Architecture, TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma       # Mô hình cơ sở dữ liệu PostgreSQL chuẩn hóa
│   │   ├── migrations/         # Các migration SQL tự động
│   │   └── seed.ts             # Script seed dữ liệu mẫu (User, Exam, Part 5, Flashcard)
│   └── src/
│       ├── prisma/             # PrismaModule & PrismaService Global
│       └── app.module.ts
├── docs/                       # Bản sao tài liệu dự án
├── docker-compose.yml          # Dịch vụ PostgreSQL 16 & Redis 7
├── package.json                # Monorepo npm workspaces orchestration
└── .env.example                # Mẫu cấu hình môi trường
```

---

## 🚀 Hướng Dẫn Khởi Chạy (Quick Start)

### 1. Chuẩn bị môi trường & Biến môi trường
```bash
# Copy file môi trường cho backend
cp .env.example backend/.env
```

### 2. Khởi động Cơ sở dữ liệu & Cache (PostgreSQL & Redis)
Nếu máy bạn có Docker Desktop đang chạy:
```bash
npm run db:up
```
> Nếu chạy PostgreSQL cục bộ mà không qua Docker, hãy đảm bảo cổng `5432` đang mở với cấu hình trong `backend/.env`.

### 3. Sinh Prisma Client & Chạy Migration khởi tạo
```bash
# Sinh client TypeScript cho Prisma
npm run prisma:generate

# Khi DB sẵn sàng, áp dụng migration và nạp dữ liệu mẫu:
npm run prisma:migrate
npm run --workspace=backend prisma:seed
```

### 4. Khởi chạy Development Servers
```bash
# Chạy đồng thời cả Frontend và Backend
npm run dev

# Hoặc chạy riêng lẻ:
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:4000
```
