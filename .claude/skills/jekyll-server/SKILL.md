---
name: jekyll-server
description: >-
  Start, stop, build and rebuild the Jekyll server of this blog locally, and choose between a
  full build and the option --incremental. Use it whenever the user wants to preview the blog or
  a post in the browser, start or restart the server, rebuild the site, or asks why a post or a
  change does not show up locally (missing from the archive, the home page, a tag or a category
  page), even if they don't say "Jekyll".
---

# Jekyll Server

How to run the blog on this machine: start, stop, build and rebuild the server, and when the
option `--incremental` is safe. The server listens on http://127.0.0.1:4000. Use `bundle exec`,
not Docker: `CLAUDE.md` explains why.

## Automatic Start with Claude Code

The hooks of `.claude/settings.json` start the server with Claude Code. The first session started
at the root of the repository starts the server with a full build, and owns it: the server stops
when this session ends. The next sessions reuse it, and leave it running when they end. A session
in a subdirectory or in a worktree does nothing.

The script `scripts/jekyll-server.sh` runs both hooks. It keeps its state in
`.claude/jekyll-server/`, ignored by Git:

File | Content
:--- | :---
`owner` | The PID of the Claude Code process that owns the server
`pid` | The PID of `jekyll serve`
`server.log` | The output of the server

A Claude Code process owns the server, not a session ID, so `/clear` and `/resume` keep the server
running. If the owner ends without its hook SessionEnd, e.g. after a crash, the next session takes
over the server. If another server already listens on the port 4000, e.g. in a terminal, the hook
doesn't start a server and doesn't touch the other one.

Note that the server stops when its owner ends, even if other sessions are still open. To get it
back, run `restart` in one of them: this session becomes the owner.

The hook SessionStart tells each session whether it owns the server. Don't start or stop a server
of the hook by hand: restart it with the script, which keeps its owner:

```sh
.claude/skills/jekyll-server/scripts/jekyll-server.sh restart                # full build
.claude/skills/jekyll-server/scripts/jekyll-server.sh restart --incremental  # incremental
.claude/skills/jekyll-server/scripts/jekyll-server.sh status
```

## Full Build or Incremental?

The command `bundle exec jekyll serve` has 2 modes:

Mode | Command | First build | After a change
:--- | :--- | :--- | :---
Full | `bundle exec jekyll serve` | 5.4 s | rebuilds the whole site
Incremental | `bundle exec jekyll serve --incremental` | 1.1 s | rebuilds the changed files only

(Measured on 2026-11-15 with 223 posts and Jekyll 4.3.1.)

The incremental mode is faster, but it can serve stale pages. Jekyll stores in
`.jekyll-metadata` what each page depends on: its own source file, its layouts and its includes.
It does not know that a page built from `site.posts` depends on the posts. So when you add a post,
the pages that list posts keep their old content: the archive (`en/archive.html`,
`cn/archive.html`), the home page, the categories, the series, the tags, the feed, etc. The page
of the new post exists, but nothing links to it.

A full build does not have this problem, and it deletes `.jekyll-metadata` (see
`lib/jekyll/cleaner.rb` in the gem `jekyll`). As a result, the next start with `--incremental` rebuilds everything once, then only the changed files.

So choose the mode as follows:

- **Full build** when posts were added, renamed or deleted since the last full build, or when
  their front matter changed (title, date, tags, categories, excerpt, series, etc.). This is the
  case the first time you preview a new post. Same after switching branches, pulling, or changing
  `_data/`.
- **Incremental** when the last full build already has every post, and you only edit the body of
  existing posts or pages. For example, the second session on the same post.

A running server cannot switch modes: stop it and start it again.

## Start

1. Check whether a server already listens on the port 4000:

   ```sh
   lsof -nP -iTCP:4000 -sTCP:LISTEN
   ```

   If one does, read its command with `ps -o args= -p <pid>`. Keep it if its mode fits the rule
   above, otherwise [stop it](#stop) first. If `.claude/jekyll-server/pid` holds its PID, the hook
   started it: use the command `restart` of the script instead, as described in
   [Automatic Start with Claude Code](#automatic-start-with-claude-code).

2. Check the dependencies with `bundle check`, and run `bundle install` if it fails. Compare
   `ruby -v` with `.ruby-version`. If that version is not installed, the active Ruby may still
   build the site, but tell the user, because the CI builds with the version of `.ruby-version`.

3. Start the server in the background, because it never exits, and write its output to a log
   file. In Claude Code, run it with Bash and `run_in_background`, and put the log in the
   scratchpad:

   ```sh
   bundle exec jekyll serve > "$LOG" 2>&1                # full build
   bundle exec jekyll serve --incremental > "$LOG" 2>&1  # incremental
   ```

4. Wait until the log shows `Server running... press ctrl-c to stop.` or an error, then check
   that the site answers:

   ```sh
   curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4000/
   ```

5. For a new post, also check that the archive lists it, with the file name of the post without
   the date and the extension (e.g. `esigelec-kubernetes-2026`):

   ```sh
   curl -s http://127.0.0.1:4000/en/archive/ | grep -c '<slug>'
   ```

   `0` means that the archive is stale: restart with a full build. For a Chinese post, use
   `/cn/archive/`.

## Stop

- If the hook started the server (`.claude/jekyll-server/pid` holds its PID), don't stop it: its
  owner stops it when it ends.
- If you started the server as a background task, stop the task (TaskStop in Claude Code).
- Otherwise, find the process with `lsof -nP -iTCP:4000 -sTCP:LISTEN`, check with
  `ps -o args= -p <pid>` that it runs `jekyll serve`, then `kill <pid>`. A server that you didn't
  start may run in the terminal of the user: ask them before stopping it.

Then check that the port is free: the command `lsof` above prints nothing.

## Rebuild

- **Restart** (stop, then start) to switch modes, after a change in `_config.yml`, or after
  `bundle install`. The automatic regeneration does not read `_config.yml` again.
- **Rebuild from scratch** when the output still looks wrong after a full build. Stop the server,
  then delete `_site/`, `.jekyll-cache/` and `.jekyll-metadata`, and start again:

  ```sh
  bundle exec jekyll clean
  ```

## Build Without Serving

To build the site as the CI does, without a server:

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

The server runs with `JEKYLL_ENV=development`, so the comments, the analytics and the page views
are not rendered locally (see `_includes/comments.html`, `_includes/analytics.html` and
`_includes/pageview.html`). Build in production mode to check them, or to compare 2 builds after
a dependency update, as described in the section "Dependency Management" of `CLAUDE.md`.

## Troubleshooting

Symptom | Cause | Fix
:--- | :--- | :---
The page of a new post exists, but the archive, the home page or a tag page doesn't list it | The server runs with `--incremental` | Restart with a full build
A post is missing everywhere | Its `date` is in the future (time zone `Europe/Paris`), or it has `published: false` | Fix the front matter, or start with `--future` to preview it
`Address already in use` | Another server listens on the port 4000 | Stop it, or start with `--port 4001`
A change in `_config.yml` has no effect | The automatic regeneration does not read `_config.yml` | Restart the server
