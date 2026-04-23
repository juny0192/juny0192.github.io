# Jun Jung — Interior Design Portfolio

Static portfolio website for Jun Jung, commercial interior designer.

## Deploying to GitHub Pages

1. **Create a GitHub account** at github.com if you don't have one.

2. **Create a new repository** named `jun-jung-portfolio` (or `<yourusername>.github.io` for a root URL).

3. **Open Git Bash or Terminal** in the `jun-jung-portfolio` folder, then run:

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jun-jung-portfolio.git
git push -u origin main
```

4. Go to your repo on GitHub → **Settings** → **Pages** → under *Source* select `main` branch → **Save**.

5. Your site will be live in ~1 minute at:
   `https://YOUR_USERNAME.github.io/jun-jung-portfolio/`

---

## Updating the AON Charlotte section

Once your company purchases the photography licenses:

1. Add the real images to `images/` (e.g., `aon-01.jpg`, `aon-02.jpg`, …)
2. Edit `index.html` — replace the `.coming-soon-project` block with a gallery or project card showing the images
3. Commit and push — the site updates automatically

## Updating the gallery

To exclude specific pages from the gallery, edit `js/gallery-config.js`:

```js
const GALLERY_CONFIG = {
  totalPages: 32,
  aonCharlottePages: [5, 6, 7, 8],  // These pages are hidden from the gallery
};
```
