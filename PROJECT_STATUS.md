 Social AI SaaS – Project Status
1. מטרת הפרויקט
מערכת SaaS לעסקים בישראל שמייצרת ומנהלת תגובות מבוססות AI לתגובות וביקורות ב:
- Facebook
- Instagram
- Google Business / Google Reviews
עקרונות מוצר מרכזיים:
- Automation-first / self-service-first
- תמיכה מלאה בעברית ובשפות נוספות
- ברירת מחדל בטוחה: REVIEW_REQUIRED
- הפרדה מלאה בין עסקים שונים (Multi-Tenant)
- הרחבה עתידית לפרסום אוטומטי, תזמון, Webhooks, Jobs/Queues, Billing ו-Frontend
2. מצב הפרויקט כיום
ה-Backend עובד מקומית ונבדק End-to-End.
Stack
- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma 7.10.0
- Docker Desktop
- OpenAI Node.js SDK
- VS Code
סביבת פיתוח
- PostgreSQL רץ ב-Docker container בשם social-ai-postgres
- PostgreSQL image: postgres:18.6
- Database port: 5432
- השרת המקומי רץ כברירת מחדל על http://localhost:3000
- GET /health פעיל
- Prisma Client נוצר תחת generated/prisma
- PowerShell חוסם npm.ps1, לכן משתמשים ב-npm.cmd וב-npx.cmd
- אין לשדרג כרגע ל-Prisma 8 RC
3. מה עובד כיום
Core Database / Multi-Tenant
קיימים ופועלים:
- User
- Business
- Membership
- Session
- BusinessAiSettings
- CustomerInteraction
Roles:
- OWNER
- ADMIN
- MEMBER
קיימת הפרדת Multi-Tenant:
- משתמש רואה רק עסקים שהוא שייך אליהם
- משתמש שאינו שייך לעסק מקבל BUSINESS_NOT_FOUND
- פעולות לפי Role מוגנות עם INSUFFICIENT_PERMISSIONS
Onboarding
POST /onboarding עובד ויוצר ב-transaction:
- User
- Business
- OWNER Membership
קיימים:
- Email normalization
- Email validation
- Duplicate email protection
- Password validation
- Stable machine-readable error codes
Authentication
Email + Password authentication עובד End-to-End.
קיימים:
- Password hashing באמצעות scrypt
- מינימום 8 תווים לסיסמה
- POST /auth/login
- GET /auth/me
- POST /auth/logout
- Server-side sessions ב-PostgreSQL
- HttpOnly cookie בשם social_ai_session
- Session expiry של 7 ימים
- SameSite=Lax
- Secure ב-production
- רק SHA-256 hash של session token נשמר ב-DB
- passwordHash ו-session hashes אינם מוחזרים מה-API
Business Routes / Authorization
קיימים:
- GET /businesses
- GET /businesses/:businessId
- PATCH /businesses/:businessId
- reusable authentication protection
- requireBusinessMembership()
- requireBusinessRole()
OWNER ו-ADMIN יכולים לבצע פעולות ניהול מורשות.
MEMBER יכול לקרוא מידע בסיסי אך לא לבצע פעולות ניהול.
Business AI Settings
קיים BusinessAiSettings לכל עסק.
הגדרות קיימות:
- replyLanguageMode
  - MATCH_CUSTOMER
  - FIXED
- defaultReplyLanguage
- replyTone
  - BALANCED
  - FRIENDLY
  - PROFESSIONAL
- replyMode
  - REVIEW_REQUIRED
  - AUTOMATIC
- customInstructions
API קיים:
- GET /businesses/:businessId/ai-settings
- PATCH /businesses/:businessId/ai-settings
ברירת מחדל:
- MATCH_CUSTOMER
- fallback language: he
- BALANCED
- REVIEW_REQUIRED
OWNER / ADMIN יכולים לעדכן.
MEMBER יכול לקרוא אך לא לעדכן.
AI Reply Engine
OpenAI integration עובד End-to-End.
קיימים:
- src/lib/openai.ts
- src/services/ai-reply.service.ts
- OpenAI model configurable דרך environment variable
- טעינת AI settings לפי העסק
- התאמת שפת התגובה לשפת הלקוח
- fallback language
- Tone
- Custom business instructions
- הגנה בסיסית מפני prompt injection מתוך תוכן הלקוח
- איסור על המצאת עובדות, הבטחות, הנחות, refunds או policies שלא נמסרו
נבדקו בהצלחה:
- English positive review
- Hebrew positive review
- Hebrew negative review
Hebrew Personalization
ה-AI מקבל גם:
- customer text
- customer name
- star rating כאשר קיים
כללי התאמת מין דקדוקי בעברית:
- להשתמש במין דקדוקי רק כשיש סימן אמין
- להעדיף רמז מפורש מתוך הטקסט
- להשתמש בשם פרטי רק כרמז משני
- כאשר אין ודאות, להשתמש בניסוח ניטרלי טבעי
Customer Interactions
קיים CustomerInteraction לשמירת תגובות וביקורות.
Supported platforms:
- FACEBOOK
- INSTAGRAM
- GOOGLE
Interaction types:
- COMMENT
- REVIEW
נשמרים בין היתר:
- business
- platform
- type
- external ID
- customer name
- customer external ID
- text
- optional 1–5 star rating
- AI suggested reply
- final reply
- AI model
- reply status
- received/published timestamps
קיימת הגנה מפני duplicate interaction לפי:
businessId + platform + externalId
API קיים:
- יצירת Interaction
- הצגת Interactions של עסק
- יצירת AI reply ל-Interaction שמורה
Reply Lifecycle
Statuses קיימים:
- PENDING_GENERATION
- PENDING_REVIEW
- READY_TO_PUBLISH
- PUBLISHED
- FAILED
Flow שכבר נבדק:
Google Review
→ נשמרת ב-PostgreSQL
→ AI מקבל text + customer name + rating + business settings
→ suggestedReply נשמר
→ aiModel נשמר
→ עסק במצב REVIEW_REQUIRED עובר ל-PENDING_REVIEW
נבדק End-to-End עם Google review מדומה בהצלחה.
4. Current Sprint
Review / Approval Workflow
המטרה הבאה:
לאפשר לבעל העסק לעבוד בפועל עם Interaction במצב PENDING_REVIEW.
ה-flow המתוכנן:
1. בעל העסק רואה את תגובת ה-AI.
2. הוא יכול לאשר אותה כפי שהיא.
3. הוא יכול לערוך אותה לפני אישור.
4. הגרסה שאושרה נשמרת ב-finalReply.
5. הרשומה עוברת לסטטוס המתאים לקראת פרסום.
6. בהמשך יתווסף publishing אמיתי לפלטפורמה.
5. Next Up
לאחר Review / Approval Workflow:
- לחזק את lifecycle של replies ואת transitions בין statuses
- לבנות publishing abstraction לפני חיבור לפלטפורמות אמיתיות
- Facebook integration
- Instagram integration
- Google Business / Google Reviews integration
- OAuth / account connection flows
- Webhooks לקבלת comments/reviews אמיתיים
- Jobs / Queues לעבודה אסינכרונית, retries ותזמון
- Logs ו-error handling מתקדמים
- Frontend
- Payments / Subscriptions
- Deployment
6. Product Backlog / Ideas
Language & AI
- Handle mixed-language comments intelligently
- Add additional reply tones if useful
- Refine AI settings UX during frontend development
- Consider additional business-specific AI preferences later
Reply Timing / Automation
- Allow businesses to control automatic reply timing
- Support immediate replies
- Support configurable delay in minutes
- Consider a future “smart / natural” reply timing mode
Hebrew Reply Personalization
- Adapt Hebrew grammatical gender when reliable signals exist
- Prefer explicit linguistic clues from the customer's text
- Use customer first name only as a secondary signal
- Fall back to natural gender-neutral Hebrew when uncertain
Review Intelligence
- Detect mismatches between review text sentiment and star rating
- Treat review text as the primary signal and star rating as a secondary signal
- If text and rating strongly conflict, flag the review for manual review
- Consider forcing REVIEW_REQUIRED when there is a strong rating/text mismatch
- Surface a warning to the business when the customer may have selected the wrong star rating
7. Technical / Safety Decisions
- Prisma CLI ו-@prisma/client נשארים כרגע על 7.10.0
- לא משדרגים ל-Prisma 8 RC בלי החלטה יזומה
- משתמשים ב-npm.cmd / npx.cmd ב-PowerShell
- לא משנים Windows Execution Policy לצורך הפרויקט
- .env לעולם לא נכנס ל-Git
- secrets לא נכנסים ל-.env.example
- API errors צריכים להשתמש ב-stable machine-readable codes
- Password minimum: 8 characters
- אין דרישה לאות גדולה / מספר / special character
- Multi-Tenant isolation הוא דרישת בסיס
- גישה לעסק זר מחזירה 404 BUSINESS_NOT_FOUND ולא חושפת קיום של העסק
- REVIEW_REQUIRED נשאר ברירת המחדל הבטוחה
- customer content נחשב untrusted input
- ה-AI לא אמור להמציא עובדות, הבטחות, refunds, discounts או policies
- automatic publishing יתאפשר רק כאשר העסק בוחר בו במפורש
- Product architecture צריכה להישאר automation-first ו-self-service-first
8. Backup & Recovery
קיים מנגנון גיבוי בסיסי:
- Source code מגובה ב-private GitHub repository
- PostgreSQL dumps נשמרים מחוץ למחשב לפי checkpoints
- .env מגובה בתוך AES-encrypted 7-Zip archive
- encrypted .env נשמר מחוץ למחשב
- backups/ נמצא ב-.gitignore
- PROJECT_CONTEXT.md נמצא בפרויקט וב-Git ומשמש handoff document
- יש לשמור על יכולת recovery מלאה במקרה של אובדן מחשב / VS Code / ChatGPT context
9. משמעות הסטטוסים החשובים
REVIEW_REQUIRED
העסק רוצה לראות ולאשר את התשובה לפני פרסום.
AI generation:
PENDING_GENERATION → PENDING_REVIEW
AUTOMATIC
העסק מאפשר למערכת להכין תשובה לפרסום אוטומטי.
AI generation:
PENDING_GENERATION → READY_TO_PUBLISH
פרסום אמיתי לפלטפורמות עדיין לא קיים.
10. Recent Completed Milestones
2026-10-09
- PostgreSQL + Prisma setup
- Core User / Business / Membership models
- Initial onboarding
- Backup foundation
2026-10-10
- Password hashing
- Email + Password login
- Persistent server-side sessions
- /auth/me
- Logout
2026-10-11
- Protected routes
- Multi-Tenant authorization
- Role-Based Authorization
- Business AI Settings
2026-10-14
- Initial OpenAI Reply Engine
- English/Hebrew reply generation tests
- Safe REVIEW_REQUIRED default
2026-10-16
- CustomerInteraction
- Facebook / Instagram / Google interaction structure
- Rating support
- Stored AI suggestions
- Hebrew grammatical-gender guidance
- End-to-End stored Google review → AI suggestion → PENDING_REVIEW

- Review / Approval Workflow completed
- OWNER / ADMIN can approve AI replies
- AI suggestions can be accepted as-is or edited before approval
- Approved reply is stored in `finalReply`
- Approved interactions move to `READY_TO_PUBLISH`

- Added publishing abstraction
- Added simulated publishing flow for Google / Facebook / Instagram
- READY_TO_PUBLISH interactions can move to PUBLISHED
- publishedAt is stored after successful publish
- Publishing is still simulated; no external platform API is called yet
- Hardened reply lifecycle transitions
- AI generation is allowed only from `PENDING_GENERATION`
- Publishing is allowed only from `READY_TO_PUBLISH`
- Duplicate publish attempts are blocked with HTTP 409
- Regenerating AI replies after lifecycle progression is blocked with HTTP 409

11. Working Method
הפרויקט מתקדם ב-mini-sprints קטנים והגיוניים.
בכל mini-sprint:
1. מסבירים מה עומדים לעשות ולמה.
2. נותנים מספר קטן של פעולות קשורות.
3. מבצעים checkpoint בנקודה ברורה.
4. בודקים שהתוצאה עובדת בפועל.
5. לא ממשיכים אם קיימת שגיאה.
6. עוצרים לפני שינוי ארכיטקטוני או פעולה מסוכנת.
7. מריצים npx.cmd tsc --noEmit ב-checkpoints משמעותיים.
8. מעדכנים את PROJECT_STATUS.md רק כשהמצב בפועל משתנה.
9. מבצעים Git commit + push לאחר checkpoint משמעותי.
המטרה: לעבוד בצורה יותר אוטונומית, יעילה ומהירה ככל שהפרויקט מתבגר, בלי לאבד שליטה על הארכיטקטורה ובלי להעמיס עשרות פעולות בבת אחת.