# Birthday Generator (GitHub Pages)

A static, zero-build birthday link generator and greeting page. Built with plain HTML, CSS, and JavaScript and ready for GitHub Pages.

## Pages
- `index.html`: link generator
- `parabens.html`: birthday page

## How to use
1) Open `index.html` locally or on GitHub Pages.
2) Fill in:
   - **Nome do aniversariante** (required)
   - **Seu nome** (optional)
   - **YouTube video ID** (optional)
   - **Limite de memes** (optional, max number of memes to show)
3) Click **Gerar link**, then copy or open the generated URL.

### Query params (parabens.html)
- `nome` (required): birthday person name
- `de` (optional): signature name
- `v` (optional): YouTube video ID
- `m` (optional): meme limit (number of memes to randomly render)

Examples:
```
parabens.html?nome=Ana
parabens.html?nome=CJ&de=Joao&v=AWiGJBIFJSc&m=6
```

## Memes setup (dynamic)
Memes are loaded from `assets/memes.json`, which is generated automatically based on your folder structure.

### Folder structure
```
assets/
  default/
    your-default-memes...
  special/
    CJ/
      cj-meme-1.gif
      cj-meme-2.jpg
```

### Remote links / embeds (optional)
You can also add URLs and embeds using a `links.txt` file inside each folder:
- `assets/default/links.txt`
- `assets/special/CJ/links.txt`

Each line should be either:
- Direct image/GIF URL
- `embed:` URL (e.g. Giphy embed)

Example `links.txt`:
```
# comments are allowed
https://example.com/meme.gif
embed:https://giphy.com/embed/XXXX
```

### Generate memes.json
Whenever you add or remove files/links, regenerate the index:
```
node scripts/generate-memes-json.js
```
This will update `assets/memes.json` with the latest lists.

## Special memes behavior
If a folder exists for a name (case-insensitive), those memes are used first.
- Without `m`: all special memes are shown.
- With `m`: special memes are used and the rest is filled with random defaults.

## YouTube video
- Default video ID is set in `script.js` (search for `DEFAULT_VIDEO_ID`).
- Autoplay is enabled with `mute=1` to work in most browsers.

## Deploy to GitHub Pages
1) Commit and push the files to GitHub.
2) Go to `Settings → Pages`.
3) Select:
   - Source: **Deploy from a branch**
   - Branch: **main** (or **master**)
   - Folder: **/ (root)**
4) Save. The site URL appears on the same page.

## Notes
- All user inputs are sanitized before rendering.
- Works offline and without any external dependencies.
