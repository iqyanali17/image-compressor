# AI Image Compressor (Production Ready)

An advanced, full-stack, AI-powered image optimization application. It combines a highly interactive React + TypeScript frontend with a robust Python Flask backend to classify, optimize, and compress images (JPG, PNG, WebP) dynamically.

## 🚀 Key Features

*   **Drag & Drop File Uploader**: Custom workspace built with touch gesture support and native mobile selectors.
*   **AI Content Classifier**: Uses Hugging Face inference models (`google/vit-base-patch16-224` and `Salesforce/blip-image-captioning-base` fallback) to categorize uploaded images and auto-recommend format conversions and quality values.
*   **Dynamic Comparison Slider**: Interactive before-and-after visual slider overlay directly within the preview card to inspect fidelity side-by-side.
*   **Real-time Analytics Dashboard**: Tracks total uploads, average storage space saved (%), and cumulative network bandwidth savings.
*   **Flexible Format Controls**: Convert images on the fly to optimized `WebP`, `JPEG`, or lossless optimized `PNG` formats.
*   **Anonymous JWT Authentication**: Secure session control tracking history records without requiring credentials.
*   **Fully Responsive & Accessible**: Follows mobile-first responsive guidelines, uses type-clamped layout calculations, and complies with WCAG accessibility standards (focus management, keyboard shortcuts, screen reader labels).

---

## 🛠️ Technology Stack

### Frontend
*   **Core**: React 19 + TypeScript (strict mode)
*   **Routing**: React Router DOM (with route-based lazy loading and code splitting)
*   **Styles**: Tailwind CSS + Framer Motion (micro-animations, modern glassmorphism UI)
*   **SEO**: React Helmet Async (fully injected dynamic Open Graph, Twitter Cards, Canonical links, JSON-LD structured schemas, and active `sitemap.xml` / `robots.txt`)

### Backend
*   **API Framework**: Python Flask (CORS-enabled)
*   **Compression Engine**: Pillow (Python Imaging Library)
*   **AI Inference**: Hugging Face Inference API
*   **Authentication**: PyJWT (Json Web Tokens)

### Database
*   **Storage**: MySQL Database (stores compression statistics and AI predictions)

---

## 📁 Project Structure

```text
Image Compressor/
├── Frontend/                      # React SPA
│   ├── public/                    # Static assets (robots.txt, sitemap.xml)
│   ├── src/
│   │   ├── components/            # UI components (common, layout)
│   │   ├── pages/                 # Route entry pages (Home, Compress, History, About, NotFound)
│   │   ├── routes/                # Client-side code-split routes
│   │   ├── seo/                   # SEO Helmet & metadata manager
│   │   ├── services/              # API Connection Layer (Axios)
│   │   └── types/                 # Type-safe interfaces
│   └── package.json
│
└── image_compressor_api/          # Flask Backend REST API
    ├── database/                  # Connection helper & migrations
    ├── middleware/                # JWT Auth & Global Error handlers
    ├── models/                    # DB Table Schema definitions
    ├── routes/                    # API Routing endpoints (images, auth)
    ├── services/                  # Business Logic (compression, HuggingFace inference)
    ├── utils/                     # Helpers (JWT generation, file handling, response formatting)
    ├── app.py                     # App entry point
    └── config.py                  # Global Config loader
```

---

## ⚙️ Configuration & Setup

### 1. Database Setup
Create a MySQL database named `image_compressor` and initialize tables using the backend migration scripts.

```sql
CREATE DATABASE image_compressor;
```

### 2. Backend Setup (`image_compressor_api`)
Create a `.env` file in the `image_compressor_api/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=image_compressor
SECRET_KEY=change-me-in-production
HF_TOKEN=your_huggingface_api_token
```

Install requirements and run:
```bash
pip install -r requirements.txt
python app.py
```
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup (`Frontend`)
Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME="AI Image Compressor"
VITE_MAX_FILE_SIZE=10485760
VITE_SUPPORTED_FORMATS=jpg,jpeg,png,webp
VITE_ENABLE_AI_ANALYSIS=true
VITE_ENABLE_HISTORY=true
```

Install dependencies and start development server:
```bash
npm install
npm run dev
```
The dev server will run on `http://localhost:5173`.
To build for production:
```bash
npm run build
```

---

## 📊 Database Schema

### `image_history`
Tracks all compression jobs associated with the client's JWT token:
*   `id`: Primary Key (Auto-Increment)
*   `user_id`: UUID string
*   `file_name`: String (Optimized file output reference)
*   `original_size`: BigInt (Bytes)
*   `compressed_size`: BigInt (Bytes)
*   `compression_percentage`: Decimal
*   `created_at`: Timestamp

### `ai_analysis`
Stores categorization records:
*   `id`: Primary Key (Auto-Increment)
*   `image_id`: Foreign Key referencing `image_history.id`
*   `image_type`: Enum/String (Photograph, Artwork, Screenshot, Document, Logo)
*   `recommended_quality`: Integer
*   `recommended_format`: String
*   `created_at`: Timestamp
