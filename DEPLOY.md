# Deploy ChatMb Media Server ke Vercel

## Step 1 - Buat GitHub Repo untuk Storage

1. Buka https://github.com/new
2. Nama repo: `chatmb-storage`
3. Set ke **Public** (supaya URL media bisa diakses)
4. Klik **Create repository**
5. Buat file kosong dulu supaya repo punya branch main:
   - Klik "creating a new file"
   - Nama file: `README.md`
   - Isi: `# ChatMb Storage`
   - Klik **Commit new file**

## Step 2 - Buat GitHub Personal Access Token

1. Buka https://github.com/settings/tokens/new
2. Note: `chatmb-media-token`
3. Expiration: **No expiration**
4. Centang scope: **repo** (full control)
5. Klik **Generate token**
6. **COPY tokennya** - hanya tampil sekali!

## Step 3 - Deploy ke Vercel

1. Buka https://vercel.com/new
2. Import dari GitHub → pilih repo `chatmb-media-server`
   (atau drag & drop folder ini)
3. Klik **Deploy**

## Step 4 - Set Environment Variables di Vercel

Setelah deploy, buka project di Vercel:
1. Tab **Settings** → **Environment Variables**
2. Tambah 3 variable:

| Name | Value |
|------|-------|
| `GITHUB_TOKEN` | token yang tadi di-copy |
| `GITHUB_OWNER` | username GitHub kamu |
| `GITHUB_REPO` | `chatmb-storage` |

3. Klik **Save** → **Redeploy**

## Step 5 - Update URL di Flutter

Buka `chatmb/lib/services/media_service.dart`, ganti:
```dart
static const String _baseUrl = 'https://chatmb-media-server.vercel.app';
```
Dengan URL Vercel kamu yang sebenarnya, contoh:
```dart
static const String _baseUrl = 'https://chatmb-media-server-username.vercel.app';
```

## Done!
Sekarang semua media (gambar, video, audio, dokumen) akan:
- Upload ke Vercel API
- Disimpan di GitHub repo `chatmb-storage`
- Bisa diakses via URL publik GitHub
