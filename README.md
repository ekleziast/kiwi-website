<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/kiwi-fruit_1f95d.png" width="80" alt="Kiwi Voice">
</p>

<h1 align="center">Kiwi Voice — Website</h1>

<p align="center">
  Landing page for <a href="https://github.com/ekleziast/kiwi-voice">Kiwi Voice</a> — open-source voice interface for OpenClaw AI agents.
</p>

---

## Stack

- **HTML** + **Tailwind CSS** (CDN) + vanilla **JavaScript**
- Bilingual EN/RU via `data-en`/`data-ru` attributes
- Fonts: Bricolage Grotesque, Onest, JetBrains Mono (Google Fonts)
- Icons: Font Awesome 6
- Dark/light theme toggle with localStorage persistence
- Docker + Nginx for production deployment

## Run locally

Open `index.html` in a browser — no build step required.

## Deploy with Docker

```bash
docker compose up -d
```

Serves on port **8080** via Nginx with gzip, caching, and security headers.

## Structure

```
index.html          Main page (bilingual EN/RU)
css/style.css       Custom styles (animations, bento grid, glass cards, theme)
js/main.js          Interactivity (scroll reveal, particles, FAQ, copy buttons)
js/i18n.js          Language switching logic
assets/             Favicon
nginx/              Nginx config for Docker
Dockerfile          Multi-stage Docker build
docker-compose.yml  Docker Compose config
```

## License

[MIT](https://github.com/ekleziast/kiwi-voice/blob/main/LICENSE)
