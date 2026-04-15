const multiparty = require('multiparty');
const fetch = require('node-fetch');
const fs = require('fs');

// Konfigurasi GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'yusrilwibu';
const GITHUB_REPO = process.env.GITHUB_REPO || 'chatmb-storage';

export default async function handler(req, res) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form
    const { fields, files } = await parseForm(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = fields.folder?.[0] || 'media';
    const fileBuffer = fs.readFileSync(file.path);
    const base64Content = fileBuffer.toString('base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.originalFilename?.split('.').pop() || 'bin';
    const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Upload ke GitHub
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`;
    
    const response = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ChatMb-Server',
      },
      body: JSON.stringify({
        message: `Upload ${fileName}`,
        content: base64Content,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'GitHub upload failed');
    }

    const data = await response.json();
    
    // Return raw URL yang bisa langsung diakses
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fileName}`;
    
    return res.status(200).json({
      success: true,
      url: rawUrl,
      fileName: fileName,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form({ maxFilesSize: 100 * 1024 * 1024 }); // 100MB
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
