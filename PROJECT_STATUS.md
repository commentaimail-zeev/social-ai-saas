# Social AI SaaS – Project Status

## מטרת הפרויקט

מערכת SaaS לעסקים בישראל שמייצרת תגובות אוטומטיות מבוססות AI
לתגובות וביקורות ברשתות חברתיות וב-Google Business.

הפלטפורמות המתוכננות:

- Facebook
- Instagram
- Google Business / Google Reviews

## טכנולוגיות

- Backend: Node.js
- שפה: TypeScript
- Backend Framework: Fastify
- Database: PostgreSQL
- ORM: Prisma
- AI מתוכנן: OpenAI API
- סביבת פיתוח: VS Code
- Containerization לפיתוח מקומי: Docker Desktop
- WSL מותקן ופועל ב-Windows

## מה כבר בוצע

### בסיס הפרויקט

- נוצר הפרויקט `social-ai-saas`
- הותקנו חבילות Node.js
- קיימת תיקיית `node_modules`
- קיים `package.json`
- קיים `package-lock.json`
- קיים `tsconfig.json`
- נוצרה תיקיית `src`
- נוצר הקובץ `src/server.ts`

### TypeScript / Node.js

- הוגדר script בשם `dev` ב-`package.json`:
  `tsx watch src/server.ts`
- TypeScript מוגדר להשתמש ב-Node types באמצעות:
  `"types": ["node"]`
- הפרויקט מוגדר כ-ES Modules באמצעות:
  `"type": "module"`
- VS Code מציג `Problems: 0`

### Fastify

- הותקן Fastify
- השרת הוסב מ-Node HTTP ידני ל-Fastify
- נוצר הקובץ `src/app.ts`
- `src/app.ts` אחראי על בניית אפליקציית Fastify
- `src/server.ts` אחראי על הפעלת השרת
- `server.ts` מייבא את `buildApp()` מתוך `app.ts`

### Routes

- נוצר route עבור `GET /`
- `GET /` מחזיר:
  `השרת עובד`
- נוצרה התיקייה `src/routes`
- נוצר הקובץ `src/routes/health.ts`
- ה-route של `GET /health` הועבר לקובץ ייעודי
- `app.ts` טוען את `healthRoutes`
- `GET /health` מחזיר:
  `{"status":"ok"}`
- `GET /` ו-`GET /health` נבדקו בפועל ועובדים בהצלחה

### משתני סביבה

- נוצר קובץ `.gitignore`
- הוגדר ש-`node_modules/` ו-`.env` לא ייכללו ב-Git
- נוצר קובץ `.env`
- הוגדר `PORT=3000`
- `server.ts` טוען את `.env` באמצעות `loadEnvFile()` של Node.js
- השרת קורא את הפורט מתוך `process.env.PORT`
- נבדק בפועל שינוי זמני ל-Port 3001
- השרת עלה בהצלחה על Port 3001
- לאחר הבדיקה ה-Port הוחזר ל-3000

### Prisma

- הותקן Prisma CLI
- Prisma הותקן תחילה בגרסת RC ולאחר מכן הוחלף לגרסה יציבה
- Prisma CLI נעול לגרסה:
  `7.10.0`
- `@prisma/client` נעול לגרסה:
  `7.10.0`
- הותקן `dotenv`
- אותחל Prisma עבור PostgreSQL
- נוצר:
  `prisma/schema.prisma`
- נוצר:
  `prisma7.config.ts`
- `prisma7.config.ts` טוען `.env`
- `prisma7.config.ts` משתמש ב:
  `env("DATABASE_URL")`
- `prisma/schema.prisma` מוגדר לעבוד עם PostgreSQL
- Prisma Client מוגדר להיווצר תחת:
  `generated/prisma`

### Docker / WSL

- הותקן WSL
- WSL פועל בהצלחה
- הותקן Docker Desktop
- Docker Engine פועל
- `docker version` מחזיר Client ו-Server תקינים
- נוצר הקובץ:
  `compose.yaml`

### PostgreSQL

- PostgreSQL רץ מקומית בתוך Docker
- Docker image:
  `postgres:18.6`
- שם ה-container:
  `social-ai-postgres`
- PostgreSQL זמין על Port:
  `5432`
- ה-container נמצא במצב:
  `healthy`
- `.env` מכיל הגדרות PostgreSQL מקומיות
- `DATABASE_URL` מוגדר עבור Prisma
- Prisma התחבר בהצלחה ל-PostgreSQL
- בוצעה בדיקת חיבור באמצעות:
  `SELECT 1;`
- הבדיקה הסתיימה בהצלחה
- הוגדרו מודלי Prisma ראשונים:
  - User
  - Business
  - Membership
- הוגדר enum בשם MembershipRole עם OWNER / ADMIN / MEMBER
- הוגדר קשר many-to-many בין Users ל-Businesses באמצעות Membership
- בוצע `prisma format`
- בוצע `prisma validate`
- ה-schema עבר validation בהצלחה

- בוצע migration ראשון בשם `init_core_models`
- נוצרה תיקיית migration:
  `prisma/migrations/20261009121941_init_core_models`
- ה-migration הוחל בהצלחה על PostgreSQL
- מסד הנתונים מסונכרן עם `prisma/schema.prisma`
- נוצרו בפועל טבלאות:
  - User
  - Business
  - Membership

  - נוצר Prisma Client בהצלחה באמצעות `prisma generate`
- Prisma Client נוצר תחת `generated/prisma`

- הותקנו `@prisma/adapter-pg` ו-`pg`
- נוצר `src/lib/prisma.ts`
- נוצר Prisma Client מרכזי עבור ה-Backend
- ה-Backend מחובר ל-PostgreSQL דרך Prisma
- נוצר endpoint זמני לבדיקת Database:
  `GET /health/db`
- בוצעה שאילתת Prisma אמיתית מתוך Fastify באמצעות `prisma.user.count()`
- החיבור נבדק בהצלחה והחזיר `userCount: 0`

- נבנה תהליך onboarding ראשון
- נוצר `src/services/onboarding.service.ts`
- נוצר `src/routes/onboarding.ts`
- `POST /onboarding` רשום ב-Fastify
- onboarding יוצר User + Business + Membership בתוך Prisma transaction
- המשתמש הראשון נוצר בהצלחה
- העסק הראשון נוצר בהצלחה
- Membership ראשון נוצר בהצלחה עם role של OWNER
- `/health/db` הורחב לבדיקת User / Business / Membership
- נבדק בפועל:
  - userCount: 1
  - businessCount: 1
  - membershipCount: 1
- חוזק תהליך ה-onboarding עם validation בסיסי
- אימייל לא תקין נדחה עם HTTP 400
- businessName ריק או שמכיל רק רווחים נדחה עם HTTP 400
- אימייל שכבר קיים נדחה עם HTTP 409
- נבדקו בפועל כל שלושת תרחישי השגיאה בהצלחה
- onboarding תקין ממשיך ליצור User + Business + OWNER Membership בתוך transaction

- נוסף השדה `passwordHash` למודל User
- בוצע migration בשם `add_password_hash`
- Prisma Client נוצר מחדש לאחר שינוי ה-schema
- נוצר `src/lib/password.ts`
- הסיסמאות עוברות hashing באמצעות scrypt של Node.js
- הוגדרה דרישת מינימום של 8 תווים לסיסמה
- אין דרישה לאות גדולה, מספר או תו מיוחד
- passwordHash אינו מוחזר בתגובת ה-API
- נבדקה סיסמה קצרה מדי והוחזר `PASSWORD_TOO_SHORT`
- נבדקה הרשמה מוצלחת עם סיסמה ונוצר משתמש חדש

## Backup & Recovery - 2026-10-09

Backup system established:

- Source code backed up to private GitHub repository.
- Local PostgreSQL dump created successfully.
- PostgreSQL dump copied to Google Drive.
- `.env` backed up inside an AES-encrypted 7-Zip archive.
- Encrypted `.env` archive copied to Google Drive.
- `backups/` added to `.gitignore`.
- Git main branch is synchronized with GitHub.
- Disaster recovery procedure documented/planned.

## Current Development Status

Onboarding with Email + Password is complete enough to move forward.

Completed:
- PostgreSQL + Prisma
- Core User / Business / Membership models
- Multi-tenant membership structure
- Business onboarding
- Input validation
- Stable API error codes
- Password hashing with scrypt
- Duplicate email protection
- Database connectivity checks
- Initial backup and recovery system

## Next Step

Build Authentication / Login with Email + Password.

Planned flow:
1. Find user by normalized email.
2. Verify that the user has a passwordHash.
3. Verify supplied password using verifyPassword().
4. Return a safe authentication result.
5. Then choose and implement the persistent authentication method
   (session/cookie or token).
## מצב נוכחי

ה-Backend הבסיסי עובד ונבדק בהצלחה.

המבנה הנוכחי כולל:

- Fastify
- TypeScript
- Routes מודולריים
- `.env`
- Prisma
- PostgreSQL
- Docker

השרת פועל על:

`http://localhost:3000`

קיים Health Check:

`http://localhost:3000/health`

PostgreSQL פועל מקומית בתוך Docker ומחובר ל-Prisma.

עדיין לא נוצרו טבלאות במסד הנתונים.

עדיין לא בוצע migration ראשון.

עדיין לא הוגדרו models עסקיים ב-Prisma.

## סביבת הפיתוח

PowerShell חוסם את `npm.ps1` בגלל Execution Policy.

לכן בשלב הנוכחי משתמשים בפקודות npm בצורה:

`npm.cmd`

לדוגמה:

`npm.cmd run dev`

ו:

`npm.cmd install ...`

לא שונתה מדיניות האבטחה של Windows.

## רכיבים שעדיין לא נבנו

- Models עסקיים ב-Database
- Users
- Businesses
- Memberships
- Authentication
- Multi-Tenant logic
- OpenAI integration
- Facebook integration
- Instagram integration
- Google Business integration
- OAuth
- Webhooks
- Jobs / Queues
- Logs מתקדמים
- Error Handling מלא
- Frontend
- Payments / Subscriptions
- Deployment

## הצעד הבא

לתכנן את מודל הנתונים הראשון של ה-SaaS לפני יצירת migration ראשון.

הכיוון המתוכנן:

- `User`
- `Business`
- `Membership`

המטרה של `Membership` היא לאפשר מבנה Multi-Tenant נכון:

- משתמש אחד יוכל להיות קשור ליותר מעסק אחד
- עסק אחד יוכל לכלול יותר ממשתמש אחד
- בעתיד ניתן יהיה להוסיף roles והרשאות

לפני יצירת migration ראשון:

1. נגדיר את שלושת ה-models
2. נבצע Prisma validation
3. נבדוק שה-schema תקין
4. רק לאחר מכן נחליט על migration ראשון

## כלל עבודה

הפרויקט מתקדם ב-mini-sprints קטנים והגיוניים.

בכל mini-sprint:

1. מסבירים מה עומדים לעשות ולמה.
2. נותנים מספר קטן של פעולות קשורות.
3. מבצעים checkpoint בנקודה ברורה.
4. בודקים שהתוצאה עובדת בפועל.
5. לא ממשיכים אם קיימת שגיאה.
6. עוצרים לפני שינויים ארכיטקטוניים או פעולות מסוכנות.
7. מעדכנים את `PROJECT_STATUS.md` בסיום שלב משמעותי.

המטרה היא לעבוד בצורה יותר אוטונומית, יעילה ומהירה,
אבל בלי לזרוק מספר גדול של משימות לביצוע בבת אחת ובלי לאבד שליטה על הארכיטקטורה.