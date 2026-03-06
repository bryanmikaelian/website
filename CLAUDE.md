# Blog

Static blog built with `lowdown` and a shell script. No framework.

## Writing a post

Create a markdown file in `posts/` with front matter:

```
---
title: Your Title
date: YYYY-MM-DD
---

Content goes here.
```

## Building

Run `./build` to generate the site into `_site/`.

## Local preview

```
cd _site && python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
