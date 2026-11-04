# CLAUDE.md: Sony 80th 3D Collection (public)

This repository is published from Hikaru Digital Marketing's private workshop repo, `Hikaru-tw/sony80-3d-workshop`, by
its `public/publish.py`. Locally, the workshop clone sits next to this one (`../sony-chf90-3d`) and its CLAUDE.md has
the full procedure. The site is https://hikaru-tw.github.io/sony80-3d-collection/ (GitHub Pages, from `main`).

## Change things in the workshop, not here

The next publish overwrites or deletes any file here that the workshop does not produce. So make a change there,
rebuild, publish into this folder, then commit and push here, after the workshop commit is pushed.

If a change has to start here (a pull request, an edit on GitHub, a quick fix), port it into the workshop before the
next publish:

- code and pages: `render/...` in the workshop
- this repo's root files (`README.md`, `LICENSE`, `CREDITS.md`, `CLAUDE.md`, `.gitignore`, `.nojekyll`): the
  workshop's `public/` folder
- generated files (`index.html`, `output/*.html`, `output/gifs/*`, `output/social.png`): don't edit them; change their
  sources in the workshop and rebuild there

Then run `python public/publish.py ../sony80-3d-collection -n` in the workshop. It should list nothing unexpected.

## Rules

- `index.html` is the workshop's `output/sony80_viewer.html` with its links pointed into `output/`. Running
  `render/build_viewer.py` here does the same rewrite, so the page can be rebuilt here too (after
  `cd render && npm install`).
- Reference photos, service-manual scans and comparison sheets are third-party. They stay in the workshop and never
  come into this repo.
- Commits here use the GitHub no-reply address set in this clone's git config. Keep it.
- The code is MIT. The illustration, textures, renders, GIFs and the Sony and Hikaru logos are not covered; see
  `LICENSE` and `CREDITS.md`.
