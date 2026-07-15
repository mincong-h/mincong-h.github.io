# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal blog (mincong.io) built with Jekyll and the TeXt Theme. The blog is bilingual (English and Chinese) with blog posts written primarily about Java, software engineering, and technology topics. The site is hosted on GitHub Pages.

## Development Commands

### Running Locally

Prefer `bundle exec` over Docker: it is faster, lighter, and matches the CI
(`.github/workflows/main.yml` builds with `ruby/setup-ruby` + `bundle exec
jekyll build`). Docker is only a fallback when no local Ruby toolchain is
available — the image ships its own Ruby, so it is actually *less*
representative of production than a local build.

Ruby version is pinned in `.ruby-version`. Locally Ruby is managed by
chruby + ruby-install (`~/.rubies/`).

```sh
# Install dependencies
bundle install

# Run Jekyll development server
bundle exec jekyll serve

# Incremental generation (faster rebuilds)
bundle exec jekyll serve --incremental

# Fallback: run via Docker (no local Ruby needed)
./docker-jekyll.sh serve
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

## Dependency Management

### Where dependencies live

File | Role
:--- | :---
`jekyll-text-theme.gemspec` | Declares the real runtime dependencies (jekyll, jekyll-* plugins, jemoji). The Gemfile pulls these in via `gemspec`.
`Gemfile` | Only the `gemspec` directive plus deliberate pins (e.g. `logger ~> 1.5.3`). Each pin has a comment explaining *why* — keep that convention.
`Gemfile.lock` | The resolved graph. This is what Dependabot scans and what CI installs.
`.ruby-version` | Ruby version, kept in sync with `ruby-version` in `.github/workflows/main.yml`.

Most vulnerable gems are **transitive** (nokogiri and activesupport via
html-pipeline/jemoji, addressable via jekyll, concurrent-ruby via
activesupport/i18n/tzinfo) with loose constraints, so they can normally be
bumped with `bundle update <gem>` without editing the Gemfile at all. Reach for
a Gemfile pin only when resolution refuses to move.

### Update policy

Be conservative — prefer patch and minor bumps. Avoid major bumps unless there
is direct evidence they don't affect rendering. Transitive majors are
acceptable when the byte-diff below is clean (this is how public_suffix 6.x was
accepted).

### Workflow

```sh
# 1. List open alerts
gh api repos/mincong-h/mincong-h.github.io/dependabot/alerts --paginate \
  --jq '.[] | select(.state=="open") | [.number, .dependency.package.name, .security_advisory.severity, .security_vulnerability.first_patched_version.identifier] | @tsv'

# 2. Baseline build BEFORE touching anything
JEKYLL_ENV=production bundle exec jekyll build -d _site_baseline

# 3. Update only the gems named in the alerts
bundle update <gem>...

# 4. Rebuild and diff against baseline
JEKYLL_ENV=production bundle exec jekyll build -d _site_updated
diff -rq _site_baseline _site_updated
```

The diff is the real test — there is no test suite. Expect *only* build
timestamps to differ; normalize them out (`sed -E
's/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+[0-9]{2}:00/TS/g'`)
and the remaining diff should be empty. Anything else is a real rendering
change and must be reviewed. Then serve locally and inspect in a browser before
opening the PR.

### Gotchas

- **Check `required_ruby_version` before assuming a gem is reachable.** A gem
  can be capped by the pinned Ruby rather than by the Gemfile. nokogiri 1.19+
  requires Ruby >= 3.2, so on Ruby 3.1 `bundle update nokogiri` silently stops
  at 1.18.x and fixes *nothing*. Verify with:
  `curl -s https://rubygems.org/api/v2/rubygems/<gem>/versions/<v>.json | jq -r .ruby_version`
- Confirm the resolved version actually clears the alert's
  `first_patched_version`; "bundler updated it" is not the same as "it's fixed".
- Jekyll 4.3.1 breaks on logger 1.6.0 (Stevenson subclass) — hence the Gemfile
  pin. Don't remove it without testing `jekyll serve`, not just `jekyll build`.

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
