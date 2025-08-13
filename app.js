const elCCP   = document.getElementById('ccp');
const elKCCP  = document.getElementById('cle-ccp');
const elKRIP  = document.getElementById('cle-rip');
const elRIP   = document.getElementById('rip');
const elStatus= document.getElementById('status');

// Pads left with zeros to given length
const zpad = (s, n) => s.toString().padStart(n, '0');

// Clé CCP:
// 1) Pad CCP to 10 digits.
// 2) Sum digit[i] * weight[i], where weights (left→right) are 13..4.
// 3) Take mod 100.
function calcCleCCP(ccpStr) {
  const s = zpad(ccpStr, 10);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const d = s.charCodeAt(i) - 48; // fast '0'..'9' to int
    sum += d * (13 - i); // weights: 13,12,...,4
  }
  return sum % 100;
}

// Clé RIP (Algérie Poste, banque 007, agence 99999):
// Simplifie à : 97 - ( ( ( (CCP % 97) * 3 ) % 97 + 85 ) % 97 )
// (si résultat = 97, utiliser 00)
function calcCleRIP(ccpStr) {
  const n = Number(ccpStr || '0'); // CCP fits safely in Number
  const r = n % 97;
  let k = 97 - (((r * 3) % 97 + 85) % 97);
  if (k === 97) k = 0;
  return k;
}

function formatRIP(ccpStr, cleRip) {
  const bank = '007';
  const agency = '99999';
  const acct = zpad(ccpStr || '0', 10);
  const key = zpad(cleRip, 2);
  return `${bank} ${agency} ${acct} ${key}`;
}

function calculate() {
  // sanitize input to digits only
  const raw = (elCCP.value || '').replace(/\D+/g, '');
  if (elCCP.value !== raw) elCCP.value = raw;

  if (!raw) {
    elKCCP.textContent = '—';
    elKRIP.textContent = '—';
    elRIP.textContent  = '—';
    elStatus.textContent = '';
    return;
  }

  // Optional: limit length to avoid accidental pastes; CCPs are typically ≤10 digits
  if (raw.length > 10) {
    elStatus.innerHTML = '<span class="err">⚠️ Saisissez au plus 10 chiffres.</span>';
  } else {
    elStatus.innerHTML = '<span class="ok">✅ Calcul en temps réel.</span>';
  }

  const cleCcp = calcCleCCP(raw);
  const cleRip = calcCleRIP(raw);

  elKCCP.textContent = zpad(cleCcp, 2);
  elKRIP.textContent = zpad(cleRip, 2);
  elRIP.textContent  = formatRIP(raw, cleRip);
}

const translations = {
  en: {
    title: "CCP Number Calculator (Algeria Poste)",
    label: "CCP Number (digits only)",
    keyCcp: "CCP Key",
    keyRip: "RIP Key",
    fullRip: "Complete RIP",
    formatHint: "Format: ",
    realtime: "✅ Real-time calculation",
    error: "⚠️ Enter max 10 digits",
    notice: "Important: This calculator has no official relationship with Algeria Poste or any official entity."
  },
  ar: {
    title: "حاسبة رقم CCP (بريد الجزائر)",
    label: "رقم CCP (أرقام فقط)",
    keyCcp: "مفتاح CCP",
    keyRip: "مفتاح RIP",
    fullRip: "RIP كامل",
    formatHint: "التنسيق: ",
    realtime: "✅ حساب فوري",
    error: "⚠️ أدخل 10 أرقام كحد أقصى",
    notice: "مهم : هذه الحاسبة لا علاقة رسمية مع بريد الجزائر أو أي جهة رسمية أخرى."
  },
  fr: {
    title: "Calculateur de numéro CCP (Algérie Poste)",
    label: "Numéro CCP (chiffres uniquement)",
    keyCcp: "Clé CCP",
    keyRip: "Clé RIP",
    fullRip: "RIP complet",
    formatHint: "Format : ",
    realtime: "✅ Calcul en temps réel",
    error: "⚠️ Saisissez au plus 10 chiffres",
    notice: "Important : Cette calculatrice n’a aucun lien officiel avec Algérie Poste ou avec une entité officielle."
  }
};

let currentLang = 'fr';

function updateTranslations() {
  const lang = currentLang === 'fr' ? 'ar' : currentLang === 'ar' ? 'en' : 'fr';
  const t = translations[lang];
  
  // Set document direction
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Force LTR for RIP number even in Arabic
  document.getElementById('rip').style.direction = 'ltr';
  document.getElementById('rip').style.textAlign = 'right';
  
  document.querySelector('h1').textContent = t.title;
  document.querySelector('label[for="ccp"]').textContent = t.label;
  document.querySelector('.row > div:nth-child(1) .k').textContent = t.keyCcp;
  document.querySelector('.row > div:nth-child(2) .k').textContent = t.keyRip;
  document.querySelector('.rip .k').textContent = t.fullRip;
  document.getElementById('notice').textContent = t.notice;
  
  // Update status message if present
  const statusEl = document.getElementById('status');
  if (statusEl.textContent.includes('✅') || statusEl.textContent.includes('⚠️')) {
    statusEl.innerHTML = statusEl.textContent.includes('✅') ? t.realtime : t.error;
  }
  
  document.getElementById('langToggle').textContent = 
    lang === 'ar' ? 'English' : lang === 'en' ? 'Français' : 'العــربيــة';
  
  currentLang = lang;
}

function setupCopyButtons() {
  const copyButtons = {
    'copy-ccp': () => elCCP.value,
    'copy-cle-ccp': () => elKCCP.textContent,
    'copy-cle-rip': () => elKRIP.textContent,
    'copy-rip': () => elRIP.textContent
  };

  Object.entries(copyButtons).forEach(([id, getText]) => {
    document.getElementById(id).addEventListener('click', () => {
      const text = getText();
      if (text && text !== '—') {
        navigator.clipboard.writeText(text);
        const originalText = document.getElementById(id).innerHTML;
        document.getElementById(id).innerHTML = '✓ Copied!';
        setTimeout(() => {
          document.getElementById(id).innerHTML = originalText;
        }, 2000);
      }
    });
  });
}

elCCP.addEventListener('input', calculate, { passive: true });
document.getElementById('langToggle').addEventListener('click', updateTranslations);
setupCopyButtons();
// Demo: prefill example so you can see it works
elCCP.value = '20392294';
calculate();
document.getElementById('notice').textContent = translations[currentLang].notice;