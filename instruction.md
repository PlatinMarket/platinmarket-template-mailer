# Canlı Sunucu Dağıtım ve Güncelleme Yönergesi (Deployment Instructions)

Bu belge, güvenlik açığı güncellemeleri ve Node.js 20 LTS geçişinin ardından projenin canlı sunucuya nasıl dağıtılacağını adım adım açıklar.

> [!IMPORTANT]
> **Sadece `git pull` yapmak yeterli değildir.**  
> Projede Node.js sürümü (Node 8 -> Node 20 LTS) ve `package.json` bağımlılıkları güncellendiği için bağımlılıkların yeniden kurulması ve çalışma ortamının Node 18/20 seviyesinde olması gerekmektedir.

---

## 1. Kodların GitHub'a Gönderilmesi (Local)

Yerel makinenizde yaptığınız değişiklikleri commit edip GitHub'a gönderin:

```bash
git add .
git commit -m "fix(security): resolve all npm vulnerabilities and upgrade to Node 20 LTS"
git push origin master
```

---

## 2. Canlı Sunucu Güncelleme Adımları

Canlı sunucunuzun mimarisine uygun olan senaryoyu uygulayınız:

### Senaryo A: Docker / Container Ortamı (Önerilen)

Eğer proje sunucuda Docker veya Docker Compose ile çalışıyorsa:

#### Seçenek 1: Sunucuda Yerel Build ile Çalışıyorsa
```bash
# 1. Proje dizinine gidin ve güncellemeleri çekin
git pull origin master

# 2. Docker imajını Node 20 ile yeniden derleyin
docker compose build --no-cache
# (veya docker-compose kullanıyorsanız: docker-compose build --no-cache)
# (doğrudan docker build kullanıyorsanız: docker build -t platinmarket-mailer .)

# 3. Yeni container'ı başlatın
docker compose up -d
# (veya docker-compose up -d)

# 4. Logları kontrol edin
docker compose logs -f --tail=50
```

#### Seçenek 2: Scaleway / Container Registry & GitHub Actions Kullanılıyorsa
1. GitHub reponuzda **Actions** sekmesine gidin.
2. **"Build Docker Image & Deploy Scaleway"** iş akışını seçip **"Run workflow"** butonuna basarak yeni imajı derleyip Scaleway Registry'ye gönderin.
3. Sunucuda yeni imajı çekip servisi yeniden başlatın:
   ```bash
   docker pull rg.fr-par.scw.cloud/platinmarket/platinmarket-mailer:<TAG>
   # Container'ı yeni imaj etiketiyle yeniden başlatın
   ```

---

### Senaryo B: Doğrudan Sunucuda Node.js / PM2 ile Çalışıyorsa

Eğer uygulama sunucu işletim sistemi üzerinde doğrudan Node.js ve PM2 ile çalışıyorsa:

#### 1. Adım: Node.js Sürümünü Doğrulayın
Sunucuda terminali açıp Node.js sürümünü kontrol edin:
```bash
node -v
```
- Sürüm **v18.x** veya **v20.x** olmalıdır.
- Eğer **Node 8.x** veya eski bir sürüm görünüyorsa, NVM veya paket yöneticisi ile Node 20'ye geçin:
  ```bash
  # NVM kullanılıyorsa:
  nvm install 20
  nvm use 20
  nvm alias default 20
  ```

#### 2. Adım: Kodları Çekin ve Paketleri Yükleyin
```bash
# Proje dizinine gidin
git pull origin master

# Yeni paketleri ve bower bağımlılıklarını kurun
npm install
```

#### 3. Adım: Servisi Yeniden Başlatın
```bash
# PM2 kullanılıyorsa:
pm2 restart all
# veya spesifik servis adı:
pm2 restart platinmarket-template-mailer

# Durumu ve logları kontrol edin:
pm2 status
pm2 logs --lines 50
```

---

## 3. Dağıtım Sonrası Doğrulama

Uygulamanın sorunsuz çalıştığından emin olmak için:

1. **Sağlık Kontrolü:**
   ```bash
   curl -I http://localhost:3000/
   ```
2. **Log Kontrolü:**
   Hata loglarında Redis veya Datastore bağlantı hatası olup olmadığını inceleyin.
3. **Testleri Çalıştırma (İsteğe Bağlı):**
   Sunucuda testleri koşturmak isterseniz:
   ```bash
   npm test
   ```
   Tüm 6 testin başarıyla geçtiğinden emin olun.
