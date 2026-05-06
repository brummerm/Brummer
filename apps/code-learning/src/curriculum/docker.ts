import type { Language } from './types.ts'

export const docker: Language = {
  id: 'docker',
  name: 'Docker',
  icon: '🐳',
  color: 'bg-sky-500',
  textColor: 'text-sky-50',
  runtime: 'static',
  description: 'Containerize anything. Docker packages apps and their dependencies into portable containers that run anywhere.',
  lessons: [
    {
      id: 'intro',
      title: '1. What is Docker?',
      content: `
<h2>The Problem Docker Solves</h2>
<p>You've probably heard: "It works on my machine!" Docker solves this classic problem. Before Docker, deploying software meant:</p>
<ul>
  <li>Installing the exact same OS, libraries, and runtime versions on every server</li>
  <li>Dependencies conflicting with other apps on the same server</li>
  <li>Hours spent troubleshooting environment differences</li>
</ul>
<h2>What is Docker?</h2>
<p>Docker is an open-source platform for building, shipping, and running applications in <strong>containers</strong>. A container packages everything an app needs — code, runtime, libraries, environment variables — into a single portable unit.</p>
<h2>Key Docker Concepts</h2>
<ul>
  <li><strong>Image</strong> — a read-only template with instructions for creating a container (like a class/blueprint)</li>
  <li><strong>Container</strong> — a running instance of an image (like an object from a class)</li>
  <li><strong>Dockerfile</strong> — a text file with instructions for building a custom image</li>
  <li><strong>Registry</strong> — a store for images (Docker Hub is the public registry)</li>
  <li><strong>Docker Compose</strong> — a tool for defining multi-container apps</li>
</ul>
<div class="tip">💡 Docker commands run in your terminal, not a browser. Install Docker Desktop from <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener">docker.com</a> to practice locally. The code editor shows commands to run — Expected Output shows what you'd see.</div>
`,
      starterCode: `# Docker doesn't run in a browser.
# These are commands you'd run in your terminal.

# Check Docker is installed
docker --version

# Pull and run a test image
docker run hello-world

# See running containers
docker ps

# See all containers (including stopped)
docker ps -a

# See all local images
docker images`,
      expectedOutput: 'Docker version 24.0.x, build abc123\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n...\n\nCONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS   NAMES\n(none running)\n\nREPOSITORY    TAG       IMAGE ID       CREATED        SIZE\nhello-world   latest    9c7a54a9a43c   5 weeks ago    13.3kB',
    },
    {
      id: 'containers-vs-vms',
      title: '2. Containers vs Virtual Machines',
      content: `
<h2>Virtual Machines (VMs)</h2>
<p>A VM emulates a complete computer, including the hardware. Each VM has its own full OS kernel, taking gigabytes of disk space and minutes to boot.</p>
<pre><code>Your Machine
└── Hypervisor (VMware, VirtualBox, etc.)
    ├── VM 1: Full OS (1–10 GB) + App A
    └── VM 2: Full OS (1–10 GB) + App B</code></pre>
<h2>Containers</h2>
<p>Containers share the host OS kernel. They're isolated at the process level and contain only the app and its dependencies — much lighter weight.</p>
<pre><code>Your Machine
└── Host OS + Docker Engine
    ├── Container 1: App A + dependencies (MB)
    └── Container 2: App B + dependencies (MB)</code></pre>
<h2>Comparison</h2>
<table>
  <tr><th>Feature</th><th>VM</th><th>Container</th></tr>
  <tr><td>Startup time</td><td>Minutes</td><td>Seconds</td></tr>
  <tr><td>Size</td><td>Gigabytes</td><td>Megabytes</td></tr>
  <tr><td>OS overhead</td><td>Full OS per VM</td><td>Shared host kernel</td></tr>
  <tr><td>Isolation</td><td>Strong (hardware level)</td><td>Good (process level)</td></tr>
  <tr><td>Portability</td><td>Good</td><td>Excellent</td></tr>
</table>
<div class="tip">💡 Containers are not a replacement for VMs — they're complementary. Containers often run <em>inside</em> VMs in cloud environments (e.g., your containers run in AWS EC2 VMs). Each layer adds isolation appropriate for the use case.</div>
`,
      starterCode: `# Demonstrating container resource efficiency

# See how little memory a running container uses
docker stats --no-stream

# Run a lightweight Alpine Linux container (only 5 MB!)
docker run --rm alpine:latest echo "Hello from Alpine!"

# Compare sizes
docker pull alpine:latest
docker pull ubuntu:latest
docker images alpine ubuntu

# Alpine is ~5MB, Ubuntu is ~75MB
# A full VM would be 1-10 GB!`,
      expectedOutput: 'CONTAINER ID   NAME   CPU %   MEM USAGE / LIMIT   MEM %\n(lightweight -- containers use far less than VMs)\n\nHello from Alpine!\n\nREPOSITORY   TAG      IMAGE ID       CREATED        SIZE\nalpine       latest   05455a08881e   3 weeks ago    7.34MB\nubuntu       latest   174c8c134b2a   5 weeks ago    77.9MB',
    },
    {
      id: 'installation',
      title: '3. Installation & Docker Desktop',
      content: `
<h2>Installing Docker</h2>
<p>The easiest way to get Docker is <strong>Docker Desktop</strong> — an application that includes Docker Engine, Docker CLI, Docker Compose, and a GUI.</p>
<h2>Installation Steps</h2>
<ol>
  <li>Go to <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener">docker.com/products/docker-desktop</a></li>
  <li>Download the installer for your OS (Mac, Windows, or Linux)</li>
  <li>Run the installer and follow the prompts</li>
  <li>Start Docker Desktop</li>
  <li>Open a terminal and run <code>docker --version</code> to verify</li>
</ol>
<h2>System Requirements</h2>
<ul>
  <li><strong>Mac</strong> — macOS 12+ (Monterey or later)</li>
  <li><strong>Windows</strong> — Windows 10/11 64-bit with WSL 2 backend</li>
  <li><strong>Linux</strong> — Install Docker Engine directly (no Docker Desktop needed)</li>
</ul>
<h2>Docker Hub Account</h2>
<p>Create a free account at <a href="https://hub.docker.com" target="_blank" rel="noopener">hub.docker.com</a> to pull public images and push your own. The Docker CLI will use this account when you run <code>docker login</code>.</p>
<div class="tip">💡 On Windows, Docker requires WSL 2 (Windows Subsystem for Linux). Docker Desktop will help you install it. On company or school computers, you may need admin privileges to install Docker.</div>
`,
      starterCode: `# Verify your Docker installation
docker --version
docker compose version

# Log in to Docker Hub (optional for pulling public images)
# docker login

# Run hello-world to confirm everything works
docker run hello-world

# Check system info
docker info

# See Docker disk usage
docker system df`,
      expectedOutput: 'Docker version 24.0.7, build afdd53b\nDocker Compose version v2.23.0\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n\nClient: Docker Engine - Community\n Server:\n  Containers: 2\n  Images: 8\n  ...\n\nTYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE\nImages          8       2        1.2GB     800MB\nContainers      3       1        200MB     180MB',
    },
    {
      id: 'first-container',
      title: '4. Your First Container',
      content: `
<h2>docker run</h2>
<p>The <code>docker run</code> command creates and starts a container from an image:</p>
<pre><code>docker run [OPTIONS] IMAGE [COMMAND]</code></pre>
<h2>Running hello-world</h2>
<pre><code>docker run hello-world</code></pre>
<p>This pulls the <code>hello-world</code> image from Docker Hub (if not already local) and runs it. The container prints a message and exits.</p>
<h2>Useful run Flags</h2>
<table>
  <tr><th>Flag</th><th>Meaning</th></tr>
  <tr><td><code>-d</code></td><td>Detached mode (run in background)</td></tr>
  <tr><td><code>-it</code></td><td>Interactive terminal</td></tr>
  <tr><td><code>--rm</code></td><td>Remove container when it stops</td></tr>
  <tr><td><code>--name</code></td><td>Give the container a name</td></tr>
  <tr><td><code>-p 8080:80</code></td><td>Map port 8080 (host) → 80 (container)</td></tr>
  <tr><td><code>-e KEY=val</code></td><td>Set environment variable</td></tr>
  <tr><td><code>-v /host:/container</code></td><td>Mount a volume</td></tr>
</table>
<h2>Interactive Containers</h2>
<pre><code># Open a bash shell inside Ubuntu container
docker run -it --rm ubuntu:latest bash

# Once inside, you can run commands:
ls /
apt-get update
exit   # stops the container</code></pre>
<div class="tip">💡 The <code>--rm</code> flag is great for one-off experiments — it automatically removes the container when it exits, keeping your system clean. For containers you want to restart, omit <code>--rm</code>.</div>
`,
      starterCode: `# Running your first container
docker run hello-world

# Run an interactive Ubuntu container
docker run -it --rm ubuntu:latest bash
# (Inside the container you can run: ls, pwd, cat /etc/os-release, exit)

# Run a named container in the background
docker run -d --name my-nginx -p 8080:80 nginx:alpine

# Check it's running
docker ps

# See its logs
docker logs my-nginx

# Stop and remove the container
docker stop my-nginx
docker rm my-nginx`,
      expectedOutput: 'Hello from Docker!\n...\n\n(interactive Ubuntu session)\nroot@abc123:/# ls\nbin  boot  dev  etc  home  lib  ...\nroot@abc123:/# exit\n\n(detached nginx)\nabc123def456...\n\nCONTAINER ID   IMAGE          COMMAND       CREATED   STATUS   PORTS                  NAMES\nabc123def456   nginx:alpine   "/docker..."  2s ago    Up 1s    0.0.0.0:8080->80/tcp   my-nginx\n\nmy-nginx is ready!\n(visit http://localhost:8080 to see the nginx welcome page)',
    },
    {
      id: 'images',
      title: '5. Docker Images',
      content: `
<h2>What is an Image?</h2>
<p>A Docker image is a read-only template made of <strong>layers</strong>. Each instruction in a Dockerfile creates a new layer. Layers are cached and shared between images — if two images share a base, they share those layers on disk.</p>
<h2>Working with Images</h2>
<pre><code># Pull an image from Docker Hub
docker pull nginx:latest
docker pull python:3.12-slim
docker pull node:20-alpine

# List local images
docker images

# Remove an image
docker rmi nginx:latest

# Remove all unused images
docker image prune

# Inspect an image
docker inspect nginx:latest

# See image history (layers)
docker history nginx:latest</code></pre>
<h2>Image Naming Convention</h2>
<pre><code>registry/user/name:tag
docker.io/library/nginx:latest   # official image
docker.io/myuser/myapp:v1.0      # your image</code></pre>
<h2>Official Images vs Community</h2>
<p>Official images (like <code>nginx</code>, <code>python</code>, <code>postgres</code>) are maintained by Docker or the software's creators. Always prefer official images — they're regularly updated for security.</p>
<div class="tip">💡 Use specific version tags (<code>python:3.12-slim</code>) rather than <code>:latest</code> in production. <code>:latest</code> can change unexpectedly and break your builds. Pin the version for reproducible builds.</div>
`,
      starterCode: `# Image management commands

# Pull specific versions
docker pull python:3.12-slim
docker pull node:20-alpine
docker pull postgres:16

# List all local images
docker images

# Get detailed info about an image
docker inspect python:3.12-slim

# See the layers that make up an image
docker history python:3.12-slim

# Tag an image with a new name
docker tag python:3.12-slim my-python:latest

# Remove a specific image
docker rmi my-python:latest

# Clean up unused images (free disk space)
docker image prune -a`,
      expectedOutput: 'REPOSITORY   TAG         IMAGE ID       CREATED        SIZE\npython       3.12-slim   abc123...      2 days ago     130MB\nnode         20-alpine   def456...      3 days ago     133MB\npostgres     16          ghi789...      1 week ago     432MB\n\n(docker inspect shows JSON metadata about the image)\n\nIMAGE          CREATED        CREATED BY                 SIZE\n<missing>      2 days ago     /bin/sh -c #(nop) CMD...   0B\n<missing>      2 days ago     /bin/sh -c pip install..   45MB\n(each line is one layer)\n\nUntagged: my-python:latest\n\nTotal reclaimed space: X.XXGB',
    },
    {
      id: 'dockerfile',
      title: '6. Writing a Dockerfile',
      content: `
<h2>What is a Dockerfile?</h2>
<p>A Dockerfile is a text file containing instructions that Docker uses to build a custom image. Every instruction creates a new layer in the image.</p>
<h2>Core Dockerfile Instructions</h2>
<table>
  <tr><th>Instruction</th><th>Purpose</th></tr>
  <tr><td><code>FROM</code></td><td>Base image (first instruction)</td></tr>
  <tr><td><code>WORKDIR</code></td><td>Set working directory for subsequent commands</td></tr>
  <tr><td><code>COPY</code></td><td>Copy files from host to image</td></tr>
  <tr><td><code>RUN</code></td><td>Execute shell command during build</td></tr>
  <tr><td><code>ENV</code></td><td>Set environment variable</td></tr>
  <tr><td><code>EXPOSE</code></td><td>Document which port the container listens on</td></tr>
  <tr><td><code>CMD</code></td><td>Default command to run when container starts</td></tr>
  <tr><td><code>ENTRYPOINT</code></td><td>Fixed command (CMD provides default args)</td></tr>
</table>
<h2>Example: Python Web App</h2>
<pre><code>FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]</code></pre>
<div class="tip">💡 Copy <code>requirements.txt</code> and install dependencies <em>before</em> copying the rest of your code. This way, Docker caches the dependency layer and only re-runs <code>pip install</code> when requirements.txt changes — not on every code change.</div>
`,
      starterCode: `# Example Dockerfile for a Python Flask app

# ---- Dockerfile ----
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first (for better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set an environment variable
ENV FLASK_ENV=production

# Tell Docker which port our app listens on (documentation only)
EXPOSE 5000

# The command to run when the container starts
CMD ["python", "app.py"]

# ---- requirements.txt ----
# flask==3.0.0
# gunicorn==21.2.0

# ---- app.py ----
# from flask import Flask
# app = Flask(__name__)
# @app.route('/')
# def hello(): return "Hello from Docker!"
# if __name__ == '__main__': app.run(host='0.0.0.0')`,
      expectedOutput: 'Sending build context to Docker daemon  4.096kB\nStep 1/7 : FROM python:3.12-slim\n ---> abc123...\nStep 2/7 : WORKDIR /app\n ---> Running in def456...\nStep 3/7 : COPY requirements.txt .\nStep 4/7 : RUN pip install --no-cache-dir -r requirements.txt\n ---> Installing flask, gunicorn...\nStep 5/7 : COPY . .\nStep 6/7 : ENV FLASK_ENV=production\nStep 7/7 : CMD ["python", "app.py"]\nSuccessfully built ghi789abc\nSuccessfully tagged myapp:latest',
    },
    {
      id: 'build-run',
      title: '7. Building & Running Images',
      content: `
<h2>Building an Image</h2>
<pre><code># Build an image from a Dockerfile in the current directory
docker build -t myapp:latest .

# Build with a specific Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t myapp .

# Flags:
# -t  tag the image (name:version)
# -f  specify Dockerfile path
# .   the build context (files Docker can access)</code></pre>
<h2>Running Your Image</h2>
<pre><code># Run the image as a container
docker run -p 5000:5000 myapp:latest

# Detached mode with a name
docker run -d -p 5000:5000 --name myapp-container myapp:latest

# With environment variables
docker run -d -p 5000:5000 \
  -e DATABASE_URL=postgres://... \
  -e SECRET_KEY=mysecret \
  myapp:latest</code></pre>
<h2>Container Management</h2>
<pre><code>docker ps              # running containers
docker ps -a           # all containers
docker logs myapp      # view logs
docker logs -f myapp   # follow (tail) logs
docker exec -it myapp bash  # open shell inside running container
docker stop myapp      # graceful stop
docker start myapp     # restart stopped container
docker rm myapp        # remove container</code></pre>
<div class="tip">💡 <code>docker exec -it CONTAINER_NAME bash</code> is incredibly useful for debugging — it opens an interactive shell inside a running container so you can inspect files, run commands, and check the environment.</div>
`,
      starterCode: `# Full workflow: build, run, manage

# 1. Build the image (from project directory)
docker build -t my-flask-app:1.0 .

# 2. Run the container
docker run -d \
  --name flask-app \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  my-flask-app:1.0

# 3. Verify it's running
docker ps

# 4. Check logs
docker logs flask-app
docker logs -f flask-app  # follow live logs

# 5. Open a shell inside the running container
docker exec -it flask-app bash

# 6. Stop and cleanup
docker stop flask-app
docker rm flask-app
docker rmi my-flask-app:1.0`,
      expectedOutput: 'Successfully built abc123...\nSuccessfully tagged my-flask-app:1.0\n\n(container ID)\ndef456abc789...\n\nCONTAINER ID   IMAGE              STATUS   PORTS                    NAMES\ndef456abc789   my-flask-app:1.0   Up 2s    0.0.0.0:5000->5000/tcp   flask-app\n\n * Running on http://0.0.0.0:5000\n * Environment: production\n\n(interactive bash inside container)\nroot@def456:/app# ls\napp.py  requirements.txt\nroot@def456:/app# exit\n\nflask-app\nflask-app\nUntagged: my-flask-app:1.0',
    },
    {
      id: 'volumes',
      title: '8. Docker Volumes',
      content: `
<h2>Why Volumes?</h2>
<p>Containers are ephemeral — when a container is removed, all data inside it is lost. <strong>Volumes</strong> solve this by storing data outside the container, on the host machine or in Docker-managed storage.</p>
<h2>Types of Storage</h2>
<ul>
  <li><strong>Volumes</strong> — Docker-managed, stored in <code>/var/lib/docker/volumes/</code>. Best for production data.</li>
  <li><strong>Bind mounts</strong> — Map a specific host directory into the container. Best for development.</li>
  <li><strong>tmpfs mounts</strong> — In-memory only, no persistence. Good for secrets.</li>
</ul>
<h2>Working with Volumes</h2>
<pre><code># Create a named volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect mydata

# Mount a volume when running a container
docker run -v mydata:/app/data myapp

# Bind mount (host path → container path)
docker run -v /home/user/project:/app myapp

# Remove a volume
docker volume rm mydata

# Remove all unused volumes
docker volume prune</code></pre>
<h2>Practical Example: PostgreSQL with Persistent Data</h2>
<pre><code>docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=mysecret \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16</code></pre>
<div class="tip">💡 For development, use bind mounts so code changes in your editor immediately reflect inside the container. For production databases, always use named volumes — they're easier to backup, restore, and manage than bind mounts.</div>
`,
      starterCode: `# Volume management

# Create a named volume
docker volume create app-data

# List volumes
docker volume ls

# Run a container with the volume mounted
docker run -d \
  --name data-container \
  -v app-data:/data \
  ubuntu:latest \
  bash -c "echo 'Hello from volume!' > /data/test.txt && sleep 3600"

# Read from the volume in a different container
docker run --rm -v app-data:/data ubuntu:latest cat /data/test.txt

# Bind mount for development (maps local code into container)
# docker run -v $(pwd):/app my-dev-image

# PostgreSQL with persistent volume
docker run -d \
  --name mydb \
  -e POSTGRES_PASSWORD=secret \
  -v pg-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# Cleanup
docker stop data-container mydb
docker rm data-container mydb
docker volume rm app-data pg-data`,
      expectedOutput: 'app-data\n\nDRIVER    VOLUME NAME\nlocal     app-data\n\n(container ID)\nabc123...\n\nHello from volume!\n\n(PostgreSQL container ID)\ndef456...\nThe files belonging to this database system will be owned by user "postgres".\n...\nLOG:  database system is ready to accept connections',
    },
    {
      id: 'networking',
      title: '9. Networking & Port Mapping',
      content: `
<h2>Docker Networking</h2>
<p>By default, containers run in isolation — they can't talk to each other or the host unless you explicitly set up networking.</p>
<h2>Port Mapping</h2>
<p>Map a host port to a container port with <code>-p host:container</code>:</p>
<pre><code>docker run -p 8080:80 nginx      # host 8080 → container 80
docker run -p 443:443 nginx      # same port
docker run -p 127.0.0.1:8080:80  # bind to localhost only</code></pre>
<h2>Docker Networks</h2>
<pre><code># Create a custom network
docker network create my-network

# Run containers on the same network
docker run -d --network my-network --name web nginx
docker run -d --network my-network --name db postgres:16

# On the same network, containers can reach each other by name:
# The web container can connect to postgres at "db:5432"

# List networks
docker network ls

# Inspect a network
docker network inspect my-network</code></pre>
<h2>Network Types</h2>
<ul>
  <li><code>bridge</code> — default; isolated network on one host</li>
  <li><code>host</code> — shares the host's network (Linux only)</li>
  <li><code>none</code> — no network access</li>
  <li>Custom bridge — like bridge but with DNS; containers can reach each other by name</li>
</ul>
<div class="tip">💡 Create a custom network for containers that need to communicate. Containers on the same custom network can reach each other by container name as the hostname — no IP addresses needed!</div>
`,
      starterCode: `# Networking examples

# Basic port mapping
docker run -d --name web -p 8080:80 nginx:alpine
docker ps  # see port mapping in output

# Stop it
docker stop web && docker rm web

# Create a custom network
docker network create app-network

# Run two containers on the same network
docker run -d \
  --name backend \
  --network app-network \
  python:3.12-alpine \
  python -m http.server 8000

docker run -d \
  --name frontend \
  --network app-network \
  -p 3000:80 \
  nginx:alpine

# List networks
docker network ls

# Inspect the network (shows which containers are attached)
docker network inspect app-network

# Cleanup
docker stop backend frontend
docker rm backend frontend
docker network rm app-network`,
      expectedOutput: 'CONTAINER ID   IMAGE          PORTS                  NAMES\nabc123...      nginx:alpine   0.0.0.0:8080->80/tcp   web\n\nNETWORK ID     NAME          DRIVER    SCOPE\nabc123...      bridge        bridge    local\ndef456...      host          host      local\nghi789...      none          null      local\njkl012...      app-network   bridge    local\n\n{\n  "Name": "app-network",\n  "Containers": {\n    "backend-id": { "Name": "backend", ... },\n    "frontend-id": { "Name": "frontend", ... }\n  }\n}',
    },
    {
      id: 'compose',
      title: '10. Docker Compose',
      content: `
<h2>What is Docker Compose?</h2>
<p>Docker Compose lets you define and run <strong>multi-container applications</strong> using a single YAML file. Instead of running many <code>docker run</code> commands, you define everything in <code>compose.yaml</code> and start it all with <code>docker compose up</code>.</p>
<h2>compose.yaml Structure</h2>
<pre><code>services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://db/mydb
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:</code></pre>
<h2>Compose Commands</h2>
<pre><code>docker compose up         # start all services
docker compose up -d      # start in background
docker compose down       # stop and remove containers
docker compose logs -f    # follow logs from all services
docker compose ps         # list running services
docker compose exec web bash  # shell into a service</code></pre>
<div class="tip">💡 Docker Compose automatically creates a network for your services and lets them reach each other by service name. This is the most common pattern for local development — run your app, database, cache, and other dependencies all at once with one command.</div>
`,
      starterCode: `# compose.yaml -- Full stack web app

services:
  # Python Flask backend
  api:
    build: ./api
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    volumes:
      - ./api:/app  # bind mount for hot reload

  # PostgreSQL database
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis cache
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres-data:

# --- Commands ---
# docker compose up -d       (start all)
# docker compose logs -f     (watch logs)
# docker compose down        (stop all)
# docker compose down -v     (stop + delete volumes)`,
      expectedOutput: '[+] Running 3/3\n ✔ Container myapp-db-1      Started   0.8s\n ✔ Container myapp-cache-1   Started   0.9s\n ✔ Container myapp-api-1     Started   1.2s\n\nNAME             IMAGE              STATUS\nmyapp-api-1      myapp-api          Up 5s\nmyapp-db-1       postgres:16-alpine Up 5s\nmyapp-cache-1    redis:7-alpine     Up 5s',
    },
    {
      id: 'hub-practices',
      title: '11. Docker Hub & Best Practices',
      content: `
<h2>Docker Hub</h2>
<p>Docker Hub (<a href="https://hub.docker.com" target="_blank" rel="noopener">hub.docker.com</a>) is the public registry for Docker images. You can browse official images, push your own, and set up automated builds.</p>
<pre><code># Login
docker login

# Tag your image for Docker Hub
docker tag myapp:latest yourusername/myapp:latest

# Push to Docker Hub
docker push yourusername/myapp:latest

# Pull it anywhere
docker pull yourusername/myapp:latest</code></pre>
<h2>Best Practices</h2>
<ul>
  <li><strong>Use slim/alpine base images</strong> — <code>python:3.12-slim</code> is 130MB vs 1GB for full image</li>
  <li><strong>One process per container</strong> — don't run nginx + postgres in one container</li>
  <li><strong>Don't store secrets in images</strong> — use environment variables or Docker secrets</li>
  <li><strong>Use .dockerignore</strong> — exclude node_modules, .git, __pycache__ from build context</li>
  <li><strong>Layer caching</strong> — put frequently-changing files last in your Dockerfile</li>
  <li><strong>Pin versions</strong> — use <code>python:3.12.1-slim</code> not <code>:latest</code></li>
  <li><strong>Run as non-root</strong> — add a user in your Dockerfile for security</li>
  <li><strong>Health checks</strong> — add <code>HEALTHCHECK</code> so Docker knows if your app is ready</li>
</ul>
<h2>Example: Production-Ready Dockerfile</h2>
<pre><code>FROM python:3.12-slim

WORKDIR /app

# Install as root, then switch to non-root user
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd -m appuser

COPY --chown=appuser:appuser . .
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]</code></pre>
<div class="tip">💡 Run <code>docker scout quickview</code> (or use Docker Desktop's Scout feature) to scan your images for vulnerabilities. Always keep base images updated — security patches are released regularly.</div>
`,
      starterCode: `# Docker Hub workflow

# 1. Build with a proper tag
docker build -t yourusername/myapp:1.0.0 .
docker build -t yourusername/myapp:latest .

# 2. Push to Docker Hub
docker login
docker push yourusername/myapp:1.0.0
docker push yourusername/myapp:latest

# 3. Pull on another machine
docker pull yourusername/myapp:1.0.0

# .dockerignore file (put in project root)
# node_modules/
# __pycache__/
# .git/
# .env
# *.pyc
# dist/
# .DS_Store

# Check image size
docker images yourusername/myapp

# Scan for vulnerabilities (Docker Scout)
docker scout quickview yourusername/myapp:latest

# Multi-platform build (for M1 Mac + Linux servers)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yourusername/myapp:latest \
  --push .`,
      expectedOutput: 'Login Succeeded\n\nThe push refers to repository [docker.io/yourusername/myapp]\nabc123...: Pushed\ndef456...: Pushed\n1.0.0: digest: sha256:abc... size: 1337\n\nREPOSITORY              TAG       SIZE\nyourusername/myapp      1.0.0     145MB\n\nScanning yourusername/myapp:latest...\n✓ No critical vulnerabilities found\n  2 medium, 5 low severity vulnerabilities\n  Run `docker scout recommendations` for fixes\n\n[+] Building for linux/amd64, linux/arm64\nSuccessfully pushed multi-platform image',
    },
  ],
}
