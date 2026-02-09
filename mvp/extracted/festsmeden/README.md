# FestSmeden™ ⚓

Svensexa-planerare med omröstning, besättningshantering och nautiskt tema.

## Snabbstart

```bash
npm install
npm start
```

Öppna `http://localhost:3000` i webbläsaren.

## Struktur

```
festsmeden/
├── server.js          # Express backend (ersätter window.storage)
├── package.json
├── public/
│   ├── index.html     # Frontend
│   └── app.jsx        # React-app (JSX, transpileras av Babel)
└── data/              # Skapas automatiskt, all data sparas här
    ├── shared/        # Delad data (omröstningar, användare etc)
    └── private/       # Privat data (remember-me etc)
```

## Deploy

Appen körs med Node.js. Kräver:
- Node.js 18+
- `npm install` för att installera Express

Sätt `PORT` env-variabel för annan port (default 3000).

### Exempel med PM2:
```bash
npm install -g pm2
pm2 start server.js --name festsmeden
```

### Bakom nginx:
```nginx
server {
    listen 80;
    server_name festsmeden.example.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## Data

All data lagras som JSON-filer i `data/` mappen. Backa upp denna för att säkra data.

## Lösenord

- **Gemensamt lösenord** (för att registrera sig): hårdkodat i app.jsx
- **Master-lösenord** (admin): hashkodat i app.jsx
- **Användarlösenord**: genereras automatiskt vid registrering
