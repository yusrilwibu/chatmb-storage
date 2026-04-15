const multiparty = require('multiparty');
const fetch = require('node-fetch');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'yusrilwibu';
const GITHUB_REPO = 'chatmb-storage';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  try {
    const { fields, files } = await parseForm(req);
    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file provided' });

    const folder = fields.folder?.[0] || 'media';
    const fileBuffer = fs.readFileSync(file.path);
    const base64Content = fileBuffer.toString('base64');

    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const ext = (file.originalFilename || 'file').split('.').pop();
    const fileName = `${folder}/${timestamp}_${random}.${ext}`;

    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`;

    const response = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ChatMb-Server',
      },
      body: JSON.stringify({
        message: `upload ${fileName}`,
        content: base64Content,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'GitHub upload failed');
    }

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${fileName}`;

    return res.status(200).json({ success: true, url: rawUrl });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form({ maxFilesSize: 100 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}
