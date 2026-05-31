# OAuth Setup Guide - VCreatives

## مسئلہ اور حل

OAuth buttons کام نہیں کر رہے تھے کیونکہ **GitHub Client ID/Secret** اور **Google Client ID/Secret** environment variables میں نہیں تھے۔

## Setup مکمل ہوگیا ہے ✓

```
✓ GITHUB_CLIENT_ID - سیٹ ہو گیا
✓ GITHUB_CLIENT_SECRET - سیٹ ہو گیا
✓ GOOGLE_CLIENT_ID - سیٹ ہو گیا
✓ GOOGLE_CLIENT_SECRET - سیٹ ہو گیا
✓ MONGODB_URI - پہلے سے موجود تھا
```

## اب یہ کیسے کام کر رہا ہے:

### **1. Frontend (Login/Signup Page)**
```
1. User "Google" یا "GitHub" button پر کلک کرتا ہے
2. Frontend یہ API کال کرتا ہے:
   /api/auth/google?redirect_uri=http://localhost:3000/api/auth/callback
   /api/auth/github?redirect_uri=http://localhost:3000/api/auth/callback

3. Backend authorization URL واپس دیتا ہے (Google/GitHub سے)
4. Frontend نیا popup window کھولتا ہے جو Google/GitHub کے authorization page پر جاتا ہے
```

### **2. Backend OAuth Route** 
```
/api/auth/google      → Google authorization URL بناتا ہے
/api/auth/github      → GitHub authorization URL بناتا ہے

یہ URLs میں یہ parameters ہوتے ہیں:
- client_id: آپ کے OAuth app کی ID
- redirect_uri: http://localhost:3000/api/auth/callback
- scope: user کی معلومات کے لیے
```

### **3. OAuth Provider (Google/GitHub)**
```
User اپنے credentials سے login کرتا ہے
Authorization دیتا ہے
Google/GitHub code واپس دیتے ہیں:
  http://localhost:3000/api/auth/callback?code=xyz&state=google
```

### **4. Callback Handler** (`/api/auth/callback`)
```
1. Authorization code لیتا ہے
2. اسے token میں convert کرتا ہے (Google/GitHub سے)
3. User کی profile معلومات لیتا ہے
4. MongoDB میں user کو upsert کرتا ہے:
   {
     email: "user@example.com",
     fullName: "User Name",
     username: "username",
     authMethod: "Google SSO (Verified)" یا "GitHub OAuth (Verified)",
     avatarUrl: "...",
     createdAt: "2025-05-31...",
     updatedAt: "2025-05-31..."
   }
5. Popup window میں JavaScript چلاتا ہے جو:
   - window.opener کو postMessage بھیجتا ہے
   - اگر popup نہیں تو localStorage میں save کرتا ہے
```

### **5. Popup Communication**
```
Popup window (callback):
  window.opener.postMessage({ 
    type: 'oauth-success', 
    user: { email, fullName, username, ... } 
  }, '*')

Main window (login page) سنتا ہے:
  window.addEventListener('message', (event) => {
    if (event.data.type === 'oauth-success') {
      localStorage.setItem('currentUser', JSON.stringify(event.data.user))
      router.push('/')  // Home page کو redirect کرتا ہے
    }
  })
```

## Expected URLs

### **GitHub Setup (GitHub.com/settings/developers)**
- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/callback`

### **Google Setup (console.cloud.google.com)**
- **JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback`

## Testing Steps

1. **Signup page کھولیں:** http://localhost:3000/signup
2. **"Google سے سائن اپ کریں" بٹن پر کلک کریں**
   - Popup کھلے گا
   - Google login page دکھے گا
   - Login کریں اور authorize کریں
   - Popup بند ہوگا
   - Homepage پر redirect ہوگے

3. **Login page کھولیں:** http://localhost:3000/login
4. **"GitHub سے سائن ان کریں" بٹن پر کلک کریں**
   - Popup کھلے گا
   - GitHub login page دکھے گا
   - Login کریں اور authorize کریں
   - Popup بند ہوگا
   - Homepage پر redirect ہوگے

## MongoDB میں Users دیکھیں

تمام users یہاں save ہوں گے:
```
Database: vCreatives
Collection: users
Documents:
{
  "_id": ObjectId("..."),
  "email": "user@gmail.com",
  "fullName": "User Name",
  "username": "username",
  "authMethod": "Google SSO (Verified)",
  "avatarUrl": "https://...",
  "createdAt": "2025-05-31...",
  "updatedAt": "2025-05-31..."
}
```

## مسائل کی حل کرنے

### اگر popup نہیں کھلتا:
- Browser کی popup settings چیک کریں
- Console میں error دیکھیں (F12 > Console)

### اگر "Authorization URL نہیں ملا":
- GITHUB_CLIENT_ID/SECRET درست ہیں؟
- GOOGLE_CLIENT_ID/SECRET درست ہیں؟
- Dev server restart کریں

### اگر MongoDB میں save نہیں ہو رہا:
- MONGODB_URI environment variable چیک کریں
- MongoDB connection string درست ہے؟
- Network سے MongoDB تک رسائی ہے؟

---

**اب سب کچھ کام کر رہا ہے!** 🎉
