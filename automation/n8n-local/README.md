# Local n8n (Docker) for Testing Integrations

This lets you run n8n locally so you can:
- import the workflows in `automation/n8n-workflows/`
- connect Slack / Gmail / Notion / HubSpot credentials
- see node-by-node execution + errors locally

## Requirements

- Docker Desktop installed and running

## Start n8n

```bash
cd automation/n8n-local
cp .env.example .env

# Generate an encryption key (required for stable credentials storage)
openssl rand -hex 32

# Put the key into .env as N8N_ENCRYPTION_KEY
docker compose up -d
```

Open: `http://localhost:5678`

## Import the Workflow

UI import:
- n8n UI -> Workflows -> Import from File
- Select `automation/n8n-workflows/05-agentic-lead-capture-orchestrator.json`

CLI import (optional):

```bash
docker compose exec n8n n8n import:workflow --input=/workflows/05-agentic-lead-capture-orchestrator.json
```

## Set n8n Variables (Required)

These workflows use `$vars.*`, so set values in:
- n8n UI -> Settings -> Variables

Minimum for notifications:
- `OWNER_EMAIL` = your admin email (where lead summaries go)
- `SLACK_CHANNEL_ID` = Slack channel id (starts with `C...`)
- `BOOKING_LINK` = booking/contact URL used in replies

If you use Notion:
- `NOTION_DATABASE_URL` or `LEADS_NOTION_DB_URL`
- `LEADS_NOTION_DEADLETTER_DB_URL` (optional, for invalid payloads)

If you use Firebase (optional in this workflow):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_WEB_API_KEY`

## Connect Credentials

After import, open each node and select credentials:

- Slack nodes: Slack credential
- Gmail nodes: Gmail credential (Auto Reply + Owner Lead Summary + Follow-up)
- Notion nodes: Notion credential
- HubSpot node: HubSpot credential
- OpenAI nodes (optional): OpenAI credential

Note: OAuth-based creds (Gmail, Slack, HubSpot) may require you to set redirect URLs in the provider.
For localhost, n8n uses:
- `http://localhost:5678/rest/oauth2-credential/callback`

## Test the Webhook Locally

1. In n8n, open the workflow and click **Test workflow**.
2. Use the test webhook URL shown by the **Lead Webhook** node.

Example curl:

```bash
curl -sS -X POST 'http://localhost:5678/webhook-test/portfolio-lead-v4' \\
  -H 'content-type: application/json' \\
  -d '{\"full_name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"hello\",\"source\":\"website\"}' | jq .
```

## About the Wait Node

`Wait Follow-up Window` is supposed to pause the execution until the follow-up window elapses.
That is normal. All immediate notifications should run *before* the wait.
