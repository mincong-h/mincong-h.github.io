# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal blog (mincong.io) built with Jekyll and the TeXt Theme. The blog is bilingual (English and Chinese) with blog posts written primarily about Java, software engineering, and technology topics. The site is hosted on GitHub Pages.

## Development Commands

### Running Locally

```sh
# Install dependencies
bundle install

# Run Jekyll development server
jekyll serve

# Or run via Docker (preferred for consistency)
./docker-jekyll.sh serve

# Incremental generation (faster rebuilds)
./docker-jekyll.sh serve --incremental
```

### Production Build

```sh
# Via npm script
npm run build

# Via Docker
./docker-build-prod.sh
```

### Content Generators

```sh
# Create a new English blog post (default)
./newpost.sh My Post Title

# Create posts in both languages
./newpost.sh --all My Post Title

# Create a Q&A style post
./newpost.sh --qna My Question

# Create a new tag page
./newtag.sh "Tag Name"

# Create a new category
./newcategory.sh "Category Name"
```

## Architecture

### Content Collections

The blog uses Jekyll collections for content organization:

- **`_posts/`**: English blog posts (published at `/en/:title/`)
- **`_cn/`**: Chinese blog posts (published at `/cn/:title/`)
- **`_series/`**: Series pages grouping related articles (e.g., "Maven Plugins")
- **`_displayed_en_categories/`**: English category pages
- **`_displayed_cn_categories/`**: Chinese category pages
- **`tags/`**: Individual tag pages

### Bilingual Support

The blog supports i18n through separate collections (`_posts` for English, `_cn` for Chinese). Articles in both languages must share the same filename to enable language switching. The `lang` front matter field distinguishes between languages (`en` or `zh`).

### Blog Post Types

There are two types of blog posts:

1. **Classic posts**: Long-form content (3000+ words) with introduction, multiple sections, and conclusion. Rich technical content exploring topics in depth.
2. **Q&A posts**: Short-form (< 1000 words) answering specific questions, similar to Stack Overflow format. Generated with `--qna` flag.

### Front Matter Structure

Key front matter fields for blog posts:

- `article_num`: Sequential article number (auto-incremented in `.article_num`)
- `type`: "classic" or "Q&A"
- `lang`: "en" or "zh"
- `date`: Creation date (ISO-8601 format)
- `date_modified`: Last modification date
- `series`: Series name (will be slugified for URL)
- `image` / `cover`: Image path for social sharing and header
- `subtitle`: One-sentence description
- `wechat`: Boolean for showing WeChat QR code

### Assets and Images

When adding new images to `/assets/`, you must register their metadata in `_data/images.yml` with fields: author, url, height, width, license, and license_url.

### Search Functionality

The blog uses a custom search solution called "nanosearch" (referenced in `_config.yml`). Search is powered by a custom backend service built with Java and Elasticsearch that indexes blog posts during the build process.

### Theme

Built on [Jekyll TeXt Theme](https://github.com/kitian616/jekyll-TeXt-theme) with extensive customizations in `_layouts/`, `_includes/`, and `_sass/`.

### Jekyll Configuration

Key settings in `_config.yml`:
- Timezone: Europe/Paris
- Permalink structure: `/en/:title/`
- Markdown processor: kramdown
- Syntax highlighter: rouge
- Mermaid diagrams: enabled
- Comments: Disqus (shortname: mincong-h)
- Analytics: Google Analytics + Datadog RUM

## Key Scripts

- `newpost.sh`: Creates new blog posts with proper front matter and naming conventions
- `newtag.sh`: Generates tag pages
- `newcategory.sh`: Generates category pages
- `docker-jekyll.sh`: Wrapper for running Jekyll in Docker with proper environment variables
- `date-modified.sh`: Updates the `date_modified` field in blog posts
