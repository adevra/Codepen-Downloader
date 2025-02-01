# Codepen Downloader

A simple Node.js script that **downloads and cleans CodePen HTML files**, also removing unnecessary `<canvas>` elements while keeping Three.js functionality intact.

---

## Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/adevra/Codepen-Downloader.git
   cd codepen-downloader
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

---

## Usage

Run the script and enter the CodePen URL when prompted:
```sh
node download.js
```
OR provide the URL directly:
```sh
node download.js "https://codepen.io/username/pen/id"
```

---

## Output

The cleaned HTML file will be saved as:
```
cleaned_codepen.html
```
Open it in a browser to see the saved CodePen.

---

## Troubleshooting

- If `puppeteer-extra` fails to install, run:
  ```sh
  npm install puppeteer puppeteer-core puppeteer-extra@3.3.6 puppeteer-extra-plugin-stealth jsdom
  ```
- If Node.js shows a module warning, add `"type": "module"` to `package.json`.

---

## License

MIT License – Free to use and modify.
