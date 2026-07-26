# Page Pulse 🌐 ⚡

Page Pulse is an instant, server-side website health and SEO audit tool. It lets users input any URL, audits it across a set of SEO heuristics, computes a comprehensive health score from 0 to 100, and displays a diagnostic dashboard styled like a developer operations center with glowing matrix-like accents.

---

## 🛠️ Tech Stack & Architecture

- **Root Monorepo**: Managed with unified package script and `concurrently` to launch client & server.
- **Backend API (`/server`)**:
  - Node.js & Express (ES Modules)
  - **Axios**: Custom HTTP crawler configured with a `10,000ms` request timeout, user-agent configuration, and custom connection/SSL fail catch maps.
  - **Cheerio**: Lightweight jQuery-like HTML parser for compiling page structures, titles, meta tags, header tags, word count, and image elements.
- **Frontend App (`/client`)**:
  - React (Vite-powered) & Tailwind CSS v3
  - **Lucide React**: Vector icons customized for diagnostic readouts.
  - **Custom SVG Progress Ring**: Custom-drawn canvas that animates and scales to the final health score.

---

## 🏎️ Quick Start

You can install all dependencies and run both servers locally using simple commands at the root project directory:

### 1. Install Dependencies
Run the command below to install root packages and auto-install package directories for both `/server` and `/client`:
```bash
npm run install-all
```

### 2. Run in Development Mode
Start the backend API server (port `3001`) and the Vite React frontend (port `5173`) concurrently:
```bash
npm run dev
```

Then, open your browser and navigate to: **[http://localhost:5173/](http://localhost:5173/)**

---

## 📊 Health-Score Heuristic Formula

Every audit begins with a base score of `100`. Deductions are applied for failing checks, capped at `0`:

| Metric Area | Heuristic Rule | Deduction |
| :--- | :--- | :--- |
| **Reachability** | The host responds with an HTTP status outside 2xx, or fails completely | **Set to `0`** |
| **Timeout (10s)** | Connection hangs for longer than 10 seconds | **Set to `0`** |
| **Page Title** | Missing `<title>` tag or empty content | **-15 points** |
| **Meta Description** | Missing `<meta name="description">` or empty description | **-10 points** |
| **H1 Headers** | Exact number of H1 tags on page is `0` or `> 1` (bad for SEO) | **-10 points** |
| **Image Alt text** | Each image missing an `alt` attribute or empty alt text | **-1 per image** (max deduction: -15) |
| **Response Speed** | Time from request to server response exceeds `3.0s` (3,000ms) | **-10 points** |

---

## 🧪 Demo Test URLs

Use these links to test and view the error handling and page analyzer in action:

1. **Standard Fast Site**: `https://www.google.com` (Health Score: `80/100`)
2. **Redirect Flow**: `http://wikipedia.org` (Redirects to HTTPS page, audits final page, note in report card)
3. **Invalid/Malformed Address**: `abc` (Prevented client-side, showing inline input error)
4. **Unreachable / DNS Fail**: `https://dnsfailcheckdomain.xyz` (Triggers `UNREACHABLE` fault card)
5. **Non-HTML document**: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf` (Triggers `INVALID_CONTENT` fault card)
6. **HTTPS/SSL Handshake Fail**: `https://self-signed.badssl.com/` (Triggers `SSL_ERROR` fault card)
