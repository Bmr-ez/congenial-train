Railway-ready cleaned Discord bot
Files kept:
- bot.py (modified to read env vars and create AutoMod rule)
- config.py
- .env.example (place your secrets in Railway environment vars)
- Procfile
- requirements.txt

How to deploy on Railway:
1. Create a new Railway project and link your repo or upload these files.
2. In Railway > Settings > Variables add:
   DISCORD_TOKEN (your bot token)
   GEMINI_KEY (your gemini key, if used)
   AUTOMOD_GUILD_ID (optional; defaults to 1311717154256851057)
3. Railway will auto-install requirements and start the worker.

Note: I removed Replit-only files and replaced direct tokens with env vars.