# 📚 Library Management System

Sistem Peminjaman Buku Perpustakaan berbasis web yang dibangun dengan React.js dan TypeScript. Aplikasi ini dirancang untuk memenuhi kebutuhan pengelolaan perpustakaan digital dengan fitur-fitur lengkap untuk admin dan user.

## 🎯 Fitur Utama

### Admin Features
- **Dashboard Admin** dengan statistik lengkap
- **CRUD Management Buku** dengan status tracking
- **Manajemen Anggota** dengan ID keanggotaan unik
- **History Peminjaman** seluruh user
- **Sistem Denda** otomatis untuk keterlambatan

### User Features  
- **Dashboard User** dengan informasi personal
- **Peminjaman Buku** dengan validasi ketersediaan
- **History Peminjaman** personal
- **Tracking Denda** dan status pembayaran

## 🛡️ Security Features

Aplikasi ini dilengkapi dengan berbagai security measures untuk testing dengan tools security:

### OWASP ZAP Testing
- **XSS Prevention**: Input sanitization pada semua form
- **SQL Injection Prevention**: Parameterized queries simulation
- **CSRF Protection**: Token validation system
- **Session Management**: Secure cookie handling
- **Rate Limiting**: Request throttling implementation

### SonarQube Analysis
- **Code Quality**: Clean code practices
- **Security Hotspots**: Vulnerability detection
- **Code Smells**: Maintainability issues
- **Duplicated Code**: DRY principle adherence
- **Test Coverage**: Comprehensive testing

### Trivy Scanning
- **Dependency Vulnerabilities**: CVE detection
- **Configuration Issues**: Security misconfigurations
- **Secret Detection**: Hardcoded credentials scanning
- **License Compliance**: Open source license checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd library-management-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env file dengan konfigurasi yang sesuai
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:3000
- Demo Credentials:
  - Admin: `admin` / `password123`
  - User: `user1` / `password123`

## 🧪 Security Testing

### OWASP ZAP Testing

1. **Setup ZAP Proxy**
```bash
# Download dan install OWASP ZAP
# Configure browser proxy ke 127.0.0.1:8080
```

2. **Automated Scan**
```bash
# Jalankan aplikasi
npm run dev

# Scan dengan ZAP CLI
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:3000
```

3. **Manual Testing Scenarios**
```bash
# Test XSS pada form input
<script>alert('XSS')</script>

# Test SQL Injection pada login
admin'; DROP TABLE users; --

# Test CSRF pada borrow book action
# Buat form HTML terpisah yang submit ke endpoint borrow
```

### SonarQube Analysis

1. **Setup SonarQube Server**
```bash
# Download SonarQube Community Edition
# Start server: bin/sonar.sh start
```

2. **Project Analysis**
```bash
# Install SonarScanner
npm install -g sonarqube-scanner

# Create sonar-project.properties
sonar.projectKey=library-management-system
sonar.projectName=Library Management System
sonar.projectVersion=1.0
sonar.sources=src
sonar.language=ts,tsx,js,jsx
sonar.sourceEncoding=UTF-8

# Run analysis
sonar-scanner
```

3. **Quality Gates**
- Coverage > 80%
- Duplicated Lines < 3%
- Maintainability Rating A
- Reliability Rating A
- Security Rating A

### Trivy Scanning

1. **Install Trivy**
```bash
# macOS
brew install trivy

# Linux
sudo apt-get install trivy
```

2. **Dependency Scanning**
```bash
# Scan package.json
trivy fs --security-checks vuln package.json

# Scan dengan output JSON
trivy fs --format json --output results.json .
```

3. **Configuration Scanning**
```bash
# Scan untuk secrets
trivy fs --security-checks secret .

# Scan untuk misconfigurations
trivy fs --security-checks config .
```

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   ├── user/           # User-specific components
│   ├── auth/           # Authentication components
│   └── common/         # Shared components
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── main.tsx           # Application entry point
```

### Security Implementation

#### Race Condition Handling
```typescript
// Optimistic locking untuk concurrent borrowing
const borrowBook = async (bookId: string, userId: string): Promise<boolean> => {
  const book = books.find(b => b.id === bookId);
  if (!book || book.status !== 'available') {
    return false;
  }

  // Simulate concurrent access check
  await new Promise(resolve => setTimeout(resolve, 100));

  const updatedBook = books.find(b => b.id === bookId);
  if (!updatedBook || updatedBook.version !== book.version) {
    return false; // Race condition detected
  }

  // Proceed with borrowing...
};
```

#### Input Sanitization
```typescript
// XSS Prevention
const sanitizedInput = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// SQL Injection Prevention (simulation)
const safeQuery = `SELECT * FROM books WHERE title = $1`;
```

## 📊 Business Rules

### Peminjaman Buku
- Durasi peminjaman: 14 hari
- Satu buku hanya bisa dipinjam oleh 1 user
- User harus memiliki kartu anggota yang valid

### Sistem Denda
- Denda keterlambatan: Rp10.000 per minggu
- Maksimal denda: Rp75.000 per buku
- Denda harus dibayar sebelum bisa meminjam lagi

### Race Condition Solutions
1. **Optimistic Locking**: Version-based conflict detection
2. **Database Constraints**: Unique constraints pada borrowing
3. **Transaction Isolation**: Proper isolation levels
4. **Queue System**: Antrian untuk high-demand books

## 🔧 Development

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📈 Performance Monitoring

### Metrics to Track
- Response time untuk borrowing operations
- Concurrent user handling
- Database query performance
- Memory usage patterns

### Security Monitoring
- Failed login attempts
- Suspicious input patterns
- Rate limiting triggers
- Session anomalies

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Security Guidelines
- Semua input harus divalidasi dan disanitasi
- Gunakan parameterized queries
- Implement proper error handling
- Follow OWASP security guidelines

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk pertanyaan atau dukungan:
- Create issue di GitHub repository
- Email: support@library-system.com

---

**Note**: Aplikasi ini dibuat untuk tujuan educational dan testing security tools. Untuk production use, implementasikan backend yang proper dengan database real dan security measures yang lebih komprehensif.