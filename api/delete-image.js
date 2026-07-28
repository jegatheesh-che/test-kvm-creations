// ================================================
// Vercel Serverless Function: Secure Cloudinary Image Deletion
// Endpoint: POST /api/delete-image
// ================================================

import { v2 as cloudinary } from 'cloudinary';

// Project 2 Authorized Studio Admin UID (kvm-creation-studio)
const AUTHORIZED_ADMIN_UID = process.env.ADMIN_UID || 'D4Etoi6NL0YUX80wtQgO77YlZ1W2';

/**
 * Verifies a Firebase Auth ID Token using Google Identity Toolkit REST API
 * @param {string} idToken - Firebase Auth ID token from client
 * @param {string} apiKey - Firebase Web API key
 * @returns {Promise<string>} Authenticated user UID
 */
async function verifyFirebaseIdToken(idToken, apiKey) {
  if (!idToken) throw new Error('Missing ID token');
  if (!apiKey) throw new Error('Missing Firebase API Key configuration');

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  const data = await response.json();

  if (!response.ok || !data.users || data.users.length === 0) {
    throw new Error('Invalid or expired authentication token');
  }

  return data.users[0].localId; // Returns authenticated UID
}

export default async function handler(req, res) {
  // 1. Enforce HTTP POST Method Only
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // 2. Extract and Validate Request Body & Tokens
    const { publicId, idToken: bodyToken } = req.body || {};
    
    // Support Authorization Bearer Header or Body Token
    const authHeader = req.headers.authorization || '';
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const idToken = headerToken || bodyToken;

    if (!publicId || typeof publicId !== 'string' || publicId.trim() === '') {
      return res.status(400).json({ success: false, error: 'Bad Request: Missing or invalid publicId.' });
    }

    if (!idToken || typeof idToken !== 'string') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication token is required.' });
    }

    // 3. Verify Firebase Auth ID Token Server-Side
    const apiKey = process.env.PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyCRJUOfEAcKVjaWC132U6OmWcDV7QXHlp4';
    const uid = await verifyFirebaseIdToken(idToken, apiKey);

    // 4. Strict Admin UID Authorization Check
    if (uid !== AUTHORIZED_ADMIN_UID) {
      console.warn(`Unauthorized deletion attempt by UID: ${uid}`);
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient administrative permissions.' });
    }

    // 5. Extract Server-Side Cloudinary Credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'vfcl8vef';
    const apiKeyCloudinary = process.env.CLOUDINARY_API_KEY;
    const apiSecretCloudinary = process.env.CLOUDINARY_API_SECRET;

    if (!apiKeyCloudinary || !apiSecretCloudinary) {
      console.error('Server Error: Missing Cloudinary API Key or Secret environment variables.');
      return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    // 6. Configure Cloudinary Engine Server-Side
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKeyCloudinary,
      api_secret: apiSecretCloudinary,
      secure: true
    });

    // 7. Execute Deletion via Cloudinary Admin SDK
    const result = await cloudinary.uploader.destroy(publicId.trim());

    if (result.result === 'ok' || result.result === 'not found') {
      return res.status(200).json({
        success: true,
        message: 'Asset successfully deleted.',
        result: result.result
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary deletion request failed.'
      });
    }

  } catch (error) {
    console.error('Delete API Error:', error.message || error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed or invalid request parameters.'
    });
  }
}
