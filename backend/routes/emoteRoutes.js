const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();
let emotesCache = null; // Cache dla szybszych odpowiedzi
let lastUpdated = 0; // Timestamp ostatniej aktualizacji

const FETCH_INTERVAL = 6 * 60 * 60 * 1000; // Co 6 godzin odświeżaj cache
const EMOTE_DIR = path.join(__dirname, '..', '..', 'public', 'emotes'); // Ścieżka do folderu na emotki

if (!fs.existsSync(EMOTE_DIR)) {
  fs.mkdirSync(EMOTE_DIR, { recursive: true });
}

async function fetchBTTVEmotes() {
  try {
    const { data } = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
    return data.map((emote) => ({
      code: emote.code,
      url: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
    }));
  } catch (error) {
    console.error('Error fetching BTTV emotes:', error.message);
    return [];
  }
}

const fetchEmotes = async () => {
  const response = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
  return response.data.map((emote) => ({
    id: emote.id,
    code: emote.code,
    url: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
  }));
};

// Endpoint do pobierania emotek
router.get('/', async (req, res) => {
  try {
    if (!emotesCache || Date.now() - lastUpdated > FETCH_INTERVAL) {
      
      const bttvEmotes = await fetchBTTVEmotes();
      emotesCache = bttvEmotes;
      //emotesCache = await fetchEmotes(); // Odśwież cache
      lastUpdated = Date.now();
    }
    res.json(emotesCache); // Zwróć listę zcache’owanych emotek
  } catch (err) {
    console.error('Error fetching BTTV emotes:', err.message);
    res.status(500).json({ message: 'Failed to fetch emotes.' });
  }
});

module.exports = router;
