#!/usr/bin/env bash
# =============================================================================
#  run.sh  —  CareDevi project runner
#  Usage:  ./run.sh <service> <command> [extra-args]
#
#  Works natively on macOS / Linux.
#  On Windows: run via Git Bash or WSL.
# =============================================================================
set -euo pipefail

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/projects/RUG -Tech/src"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

# Colours (only when stdout is a terminal) 
if [ -t 1 ]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  CYAN=$'\033[0;36m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; RESET=''
fi

info()  { echo -e "${CYAN}[run]${RESET}  $*"; }
ok()    { echo -e "${GREEN}[ ok]${RESET}  $*"; }
warn()  { echo -e "${YELLOW}[warn]${RESET} $*"; }
die()   { echo -e "${RED}[err]${RESET}  $*" >&2; exit 1; }

# Python detection 
find_python() {
  for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null && \
       "$cmd" -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" 2>/dev/null; then
      echo "$cmd"; return 0
    fi
  done
  die "Python 3.10+ not found or not in PATH.\nPlease install Python 3.10+ from https://python.org and ensure it is available in your PATH.\nOn Windows, use 'py -3.10 -m venv .venv' if 'python' does not work."
}

# On Windows (Git Bash) venvs use Scripts/, on Unix they use bin/
venv_bin() {
  if [ -d "$VENV_DIR/Scripts" ]; then
    echo "$VENV_DIR/Scripts"
  else
    echo "$VENV_DIR/bin"
  fi
}

activate_venv() {
  if [ ! -d "$VENV_DIR" ]; then
    warn "Virtual environment not found — running 'backend setup' first..."
    backend_setup
  fi
  # shellcheck source=/dev/null
  source "$(venv_bin)/activate"
}

# backend 
backend_setup() {
  local python
  python="$(find_python)"
  info "Creating virtual environment → $VENV_DIR"
  "$python" -m venv "$VENV_DIR" || die "Failed to create virtual environment. Try deleting $VENV_DIR and rerun."
  local pip
  pip="$(venv_bin)/pip"
  info "Upgrading pip..."
  "$pip" install --upgrade pip -q || die "Failed to upgrade pip. Ensure internet connectivity and try again."
  info "Installing Python dependencies..."
  "$pip" install -r "$BACKEND_DIR/requirements.txt" || die "Failed to install dependencies. Check requirements.txt and your Python environment."
  ok "Backend setup complete."
  echo -e "  Activate manually with:  ${BOLD}source \"$(venv_bin)/activate\"${RESET}"
# =============================
# WINDOWS USERS:
# =============================
# If you encounter issues with venv activation or pip, run these commands manually in PowerShell:
#   py -3.10 -m venv .venv
#   .venv\Scripts\Activate.ps1
#   python -m pip install --upgrade pip
#   python -m pip install -r requirements.txt
#
# If you use Git Bash, use:
#   source .venv/Scripts/activate
# =============================
}

backend_dev() {
  activate_venv
  info "Starting FastAPI dev server on http://localhost:8000  (hot-reload enabled)"
  cd "$BACKEND_DIR"
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

backend_start() {
  activate_venv
  info "Starting FastAPI production server on http://localhost:8000"
  cd "$BACKEND_DIR"
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
}

backend_migrate() {
  activate_venv
  info "Applying Alembic migrations → head"
  cd "$BACKEND_DIR"
  alembic upgrade head
  ok "Migrations applied."
}

backend_makemigrations() {
  activate_venv
  local msg="${1:-auto}"
  info "Generating Alembic revision: \"$msg\""
  cd "$BACKEND_DIR"
  alembic revision --autogenerate -m "$msg"
  ok "Migration file created."
}

backend_test() {
  activate_venv
  info "Running pytest..."
  cd "$BACKEND_DIR"
  python -m pytest "$@"
}

backend_lint() {
  activate_venv
  info "Running ruff (or flake8 fallback)..."
  cd "$BACKEND_DIR"
  if command -v ruff &>/dev/null; then
    ruff check .
  elif command -v flake8 &>/dev/null; then
    flake8 .
  else
    warn "No linter found. Install ruff: pip install ruff"
  fi
}

backend_seed() {
  activate_venv
  info "Seeding development data (clinic + admin + doctor)..."
  cd "$BACKEND_DIR"
  python seed.py
  ok "Seed completed."
}

# frontend 
ensure_node() {
  command -v node &>/dev/null || die "Node.js not found. Install from https://nodejs.org"
  command -v npm  &>/dev/null || die "npm not found. Install Node.js from https://nodejs.org"
}

frontend_setup() {
  ensure_node
  info "Installing Node.js dependencies..."
  cd "$FRONTEND_DIR"
  npm install
  ok "Frontend setup complete."
}

frontend_dev() {
  ensure_node
  info "Starting Next.js dev server on http://localhost:3000"
  cd "$FRONTEND_DIR"
  npm run dev
}

frontend_build() {
  ensure_node
  info "Building Next.js for production..."
  cd "$FRONTEND_DIR"
  npm run build
  ok "Frontend build complete."
}

frontend_start() {
  ensure_node
  info "Starting Next.js production server on http://localhost:3000"
  cd "$FRONTEND_DIR"
  npm run start
}

frontend_lint() {
  ensure_node
  info "Running ESLint..."
  cd "$FRONTEND_DIR"
  npm run lint
}

# worker 
worker_start() {
  activate_venv
  info "Starting Celery worker..."
  cd "$BACKEND_DIR"
  celery -A app.worker.celery_app worker --loglevel=info "$@"
}

worker_beat() {
  activate_venv
  info "Starting Celery beat scheduler..."
  cd "$BACKEND_DIR"
  celery -A app.worker.celery_app beat --loglevel=info "$@"
}

# help 
usage() {
  cat <<EOF

${BOLD}CareDevi · Project Runner${RESET}
${CYAN}Usage:${RESET} ./run.sh <service> <command> [args]

${BOLD}backend${RESET}
  setup                   Create .venv and install Python dependencies
  dev                     Start FastAPI with hot-reload          (port 8000)
  start                   Start FastAPI in production mode       (port 8000)
  migrate                 Apply Alembic migrations  (upgrade head)
  makemigrations [msg]    Generate a new Alembic revision
  seed                    Insert/update demo clinic + admin + doctor users
  test       [pytest-args] Run pytest suite
  lint                    Run ruff / flake8

${BOLD}frontend${RESET}
  setup                   Run npm install
  dev                     Start Next.js dev server               (port 3000)
  build                   Build Next.js for production
  start                   Start built Next.js production server  (port 3000)
  lint                    Run ESLint

${BOLD}worker${RESET}
  start      [celery-args] Start Celery worker
  beat       [celery-args] Start Celery beat scheduler

${BOLD}Examples${RESET}
  ./run.sh backend setup
  ./run.sh backend dev
  ./run.sh frontend setup
  ./run.sh frontend dev
  ./run.sh backend migrate
  ./run.sh backend seed
  ./run.sh backend test -v
  ./run.sh backend makemigrations "add audit log table"
  ./run.sh worker start --concurrency=4

EOF
  exit 0
}

# dispatch 
SERVICE="${1:-}"
COMMAND="${2:-}"
shift 2 2>/dev/null || true   # remaining args forwarded to sub-commands

case "$SERVICE" in
  backend)
    case "$COMMAND" in
      setup)           backend_setup ;;
      dev)             backend_dev ;;
      start)           backend_start ;;
      migrate)         backend_migrate ;;
      makemigrations)  backend_makemigrations "$@" ;;
      seed)            backend_seed ;;
      test)            backend_test "$@" ;;
      lint)            backend_lint ;;
      *)               usage ;;
    esac ;;
  frontend)
    case "$COMMAND" in
      setup)   frontend_setup ;;
      dev)     frontend_dev ;;
      build)   frontend_build ;;
      start)   frontend_start ;;
      lint)    frontend_lint ;;
      *)       usage ;;
    esac ;;
  worker)
    case "$COMMAND" in
      start)   worker_start "$@" ;;
      beat)    worker_beat "$@" ;;
      *)       usage ;;
    esac ;;
  help|--help|-h|"") usage ;;
  *) die "Unknown service '${SERVICE}'. Run './run.sh help' for usage." ;;
esac
