# Docker: как это устроено и что делать с базой

## Зачем Docker (коротко)

- **Образ (image)** — «слепок» приложения с ОС, Node и файлами. Его можно собрать один раз и запускать где угодно одинаково.
- **Контейнер** — запущенный процесс из образа. Изолирован от хоста, но может слушать порты и монтировать **тома** для данных.
- **Docker Compose** — один файл (`docker-compose.yml`), который поднимает **несколько** сервисов (у нас: MongoDB, API, SSR-сайт), общую сеть и **именованный том** для Mongo.

В итоге на сервере не нужно вручную ставить Mongo и подгонять версии Node — `docker compose up` поднимает связку.

## Что в этом проекте

| Сервис | Образ / сборка | Роль |
|--------|------------------|------|
| `mongo` | официальный **`mongo:7`** | «Стоковая» MongoDB, данные в томе **`mongo_data`** (на диске сервера, переживает перезапуск контейнера). |
| `api` | `projectBeton-server/Dockerfile` | Node API на порту **3000** (только внутри сети compose). |
| `web` | `projectBeton-client/Dockerfile` | Собранный Angular SSR на **4000**, проксирует `/api` → `http://api:3000`. |

Порт **27017** наружу **не** пробрасывается — к БД из интернета не достучаться, только `api` внутри Docker-сети.

## Перед первым запуском

1. Скопируйте секреты (обязательно **`JWT_SECRET`** при `NODE_ENV=production` в контейнере API):

   ```bash
   cp projectBeton-server/.env.example projectBeton-server/.env
   ```

   Отредактируйте `.env`: `JWT_SECRET`, почта, при необходимости `CORS_ORIGINS`, `RECAPTCHA_SECRET_KEY` и т.д.

2. Сборка и старт:

   ```bash
   cd projectBeton-main
   docker compose up -d --build
   ```

3. Откройте **http://localhost:4000** (с хост-машины порт проброшен на сервис `web`).

Логи:

```bash
docker compose logs -f web
docker compose logs -f api
docker compose logs -f mongo
```

Остановка:

```bash
docker compose down
```

Данные Mongo **сохраняются**, пока не выполните `docker compose down -v` (флаг `-v` удалит том).

---

## Перенести текущую локальную БД в Docker на сервере

Идея: сделать **дамп** с твоего ПК, где уже есть Mongo с базой `projectBeton`, затем **восстановить** в контейнере.

### 1) Дамп на машине, где крутится старая Mongo

```bash
mongodump --db projectBeton --out ./projectBeton-dump
```

Появится каталог `projectBeton-dump/projectBeton/` с BSON-файлами.

### 2) Скопировать дамп на сервер

Любым способом (scp, архив, облако).

### 3) На сервере: контейнер Mongo уже запущен (`docker compose up -d`)

Скопируйте **папку с именем базы** (внутри дампа это обычно `projectBeton-dump/projectBeton/`) в контейнер и восстановите:

```bash
docker compose cp ./projectBeton-dump/projectBeton mongo:/tmp/projectBeton
docker compose exec mongo mongorestore --drop --db projectBeton /tmp/projectBeton
```

`--drop` удалит коллекции в целевой БД перед заливкой (удобно для полного совпадения с локальной копией). Если не нужно затирать — уберите `--drop`.

После этого API подключится к той же базе `projectBeton` внутри тома.

---

## Продакшен за Nginx

Снаружи обычно только **443**. Порты **4000/3000** не светят в интернет: Nginx проксирует на `127.0.0.1:4000` (как в `deploy/nginx-site.example.conf`). Тогда для SSR выставьте **`TRUST_PROXY=1`** и реальные домены в **`NG_ALLOWED_HOSTS`** (переменные в `docker-compose` для сервиса `web` или через `env_file`).

---

## Образы и размер

Первый `docker compose build` скачает базовые образы Node и Mongo — это нормально. Дальше сборка быстрее за счёт кэша слоёв Docker.
