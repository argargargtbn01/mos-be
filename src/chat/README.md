# Hệ thống xử lý tài liệu RAG

## 1. Luồng đẩy tài liệu vào hệ thống

### Các bước chính:

#### Người dùng upload tài liệu qua CMS:
- Người dùng (CMS) gửi file hoặc tài liệu mới lên hệ thống.

#### DataHub nhận và xử lý tài liệu:
- DataHub nhận file từ CMS.
- DataHub lưu file gốc vào AWS S3 và ghi metadata (thông tin về file, ví dụ: bucket, path, tên file) vào PostgreSQL.
- Sau khi lưu, DataHub đẩy một job vào RabbitMQ (queue) để kích hoạt quá trình xử lý tài liệu.

#### Data Processing Service xử lý tài liệu:
- Service nhận job từ RabbitMQ.
- Service lấy file từ AWS S3, chuyển đổi nội dung, chia nhỏ (chunk) tài liệu.
- Gửi nội dung từng chunk qua AIHub để tạo embedding.
- Lưu embedding cùng với nội dung chunk vào PostgreSQL (vector và metadata).
- Sau cùng, cập nhật trạng thái tài liệu trong PostgreSQL (ví dụ từ `"Processing"` sang `"Indexed"`).

---

## 2. Sơ đồ luồng hoạt động (Diagram)

```mermaid
flowchart TD
    subgraph Upload Flow
        A[CMS (Người dùng)] -->|Upload tài liệu| B[DataHub]
    end

    subgraph Lưu trữ & Queue
        B -->|Lưu file| C[AWS S3]
        B -->|Ghi metadata| D[PostgreSQL<br/>(Metadata)]
        B -->|Đẩy job xử lý| E[RabbitMQ Queue]
    end

    subgraph Xử lý tài liệu (Data Processing)
        E --> F[Data Processing Service]
        F -->|Lấy file| C
        F -->|Chia nhỏ file| G[Text Chunks]
        G -->|Tạo embedding qua API| H[AIHub<br/>(Vector hóa)]
        H -->|Trả về embedding| F
        F -->|Lưu embedding| D[PostgreSQL<br/>(Vector & Metadata)]
        F -->|Cập nhật trạng thái| D
    end

    subgraph Giao tiếp với người dùng
        A <-->|HTTP (Query)| I[AIHub<br/>(Vector hóa & Sinh câu trả lời)]
        I <-->|HTTP Response| A
    end
