# Social AI SaaS – Disaster Recovery Guide

מסמך זה מיועד לשחזור הפרויקט במקרה של אובדן מחשב, מחיקת סביבת העבודה
או צורך להעביר את הפרויקט למחשב חדש.

## מיקומי הגיבוי

### קוד
GitHub Private Repository:

https://github.com/commentaimail-zeev/social-ai-saas

### Database
גיבויי PostgreSQL נשמרים ב-Google Drive.

דוגמה:

social_ai_2026-10-09.dump

### Secrets
קובץ `.env` אינו נשמר ב-GitHub.

יש לשחזר אותו מהגיבוי המאובטח של ה-secrets.

קיים בפרויקט `.env.example` שמציג אילו משתנים נדרשים,
אך אינו מכיל סיסמאות אמיתיות.

---

# שחזור על מחשב חדש

## 1. התקנת תוכנות

יש להתקין:

- Git
- Node.js
- VS Code
- WSL
- Docker Desktop

יש לוודא ש-Docker Desktop פועל.

---

## 2. הורדת הפרויקט

ב-Terminal:

git clone https://github.com/commentaimail-zeev/social-ai-saas.git

cd social-ai-saas

---

## 3. שחזור .env

יש ליצור בשורש הפרויקט קובץ:

.env

ולשחזר אליו את התוכן מהגיבוי המאובטח.

אין להעלות `.env` ל-GitHub.

---

## 4. התקנת חבילות Node

ב-PowerShell:

npm.cmd install

---

## 5. הפעלת PostgreSQL

docker compose up -d

בדיקה:

docker compose ps

יש לוודא שה-container:

social-ai-postgres

נמצא במצב:

healthy

---

## 6. שחזור Database מגיבוי

יש להוריד את קובץ ה-dump מ-Google Drive ולהכניס אותו לתיקיית:

backups

לדוגמה:

backups/social_ai_2026-10-09.dump

להעתיק את הקובץ ל-container:

docker cp .\backups\social_ai_2026-10-09.dump social-ai-postgres:/tmp/social_ai_backup.dump

לשחזר:

docker exec social-ai-postgres pg_restore -U socialai -d social_ai --clean --if-exists /tmp/social_ai_backup.dump

---

## 7. יצירת Prisma Client

npx.cmd prisma generate

---

## 8. הפעלת ה-Backend

npm.cmd run dev

---

## 9. בדיקות

בדפדפן:

http://localhost:3000

אמור להחזיר:

השרת עובד

בדיקת Database:

http://localhost:3000/health/db

התגובה צריכה להראות:

status: ok
database: connected

---

# שחזור ללא Database Backup

אם אין dump ורוצים רק ליצור Database חדש וריק:

docker compose up -d

npx.cmd prisma migrate deploy

npx.cmd prisma generate

---

# מידע נוסף

מצב הפרויקט והצעד הבא נמצאים בקובץ:

PROJECT_STATUS.md

היסטוריית השינויים נמצאת ב-Git.

קוד המקור והמיגרציות נשמרים ב-GitHub.
נתוני PostgreSQL מגובים בנפרד.
Secrets אינם נשמרים ב-GitHub.