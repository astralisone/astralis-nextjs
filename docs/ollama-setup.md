# Deploying Ollama on Fly.io

Yes, Fly.io is a great place to run Ollama because they support **Persistent Volumes** (essential for storing models) and **GPU Machines** (optional but recommended for larger models).

## 1. Create a `fly.toml` for Ollama

Create a new directory for your Ollama deployment and add this `fly.toml`:

```toml
app = "your-app-name-ollama"
primary_region = "iad"  # Choose a region close to your Next.js app

[build]
  image = "ollama/ollama:latest"

[mounts]
  source = "ollama_data"
  destination = "/root/.ollama"

[http_service]
  internal_port = 11434
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  size = "shared-cpu-2x" # Increase RAM if running 7b+ models
  memory = "4gb"       # 4GB is good for 1b-3b models. Use 8gb+ for 7b.
```

## 2. Deploy

```bash
# 1. Create the app
fly launch --no-deploy

# 2. Create the volume for models (Size in GB)
fly volumes create ollama_data --size 10

# 3. Deploy
fly deploy
```

## 3. Pull Your Model

Once deployed, you need to pull the model into the volume. You can do this via SSH console:

```bash
fly ssh console
# Inside the VM:
ollama pull gemma3:1b
exit
```

## 4. Connect Astralis to Fly.io

### Scenario A: Both apps on Fly.io (Private Network)
If your Next.js app is also on Fly.io in the same organization:
```bash
OLLAMA_BASE_URL=http://your-app-name-ollama.internal:11434
```

### Scenario B: Next.js on Vercel (Public Internet)
You must expose the Fly app publicly. The `fly.toml` above already exposes port 11434 via https.
```bash
OLLAMA_BASE_URL=https://your-app-name-ollama.fly.dev
```

> **Security Note:** If exposing publicly, Ollama does not have built-in authentication. It is highly recommended to add a proxy sidecar (like Nginx with Basic Auth) or use Fly.io's private networking (WireGuard) to connect from Vercel.
