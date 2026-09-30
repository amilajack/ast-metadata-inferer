#!/usr/bin/env bash
# Prints a Markdown summary of the records added, removed or changed between two compat.json files.
# Usage: compat-diff.sh <base compat.json> <head compat.json>
set -euo pipefail

jq -n -r --slurpfile base "$1" --slurpfile head "$2" --argjson limit "${LIMIT:-1000}" '
  def by_id: map({key: .protoChainId, value: .}) | from_entries;
  def section($title; $items):
    if ($items | length) == 0 then empty else
      "<details><summary>\($title) (\($items | length))</summary>\n\n```\n"
      + ($items[:$limit] | join("\n"))
      + (if ($items | length) > $limit then "\n… and \(($items | length) - $limit) more" else "" end)
      + "\n```\n\n</details>\n"
    end;

  ($base[0] | by_id) as $b
  | ($head[0] | by_id) as $h
  | (($h | keys) - ($b | keys)) as $added
  | (($b | keys) - ($h | keys)) as $removed
  | [
      ($b | keys)[] as $id
      | select($h | has($id))
      | ["astNodeTypes", "isStatic", "compat"] | map(select($b[$id][.] != $h[$id][.]))
      | select(length > 0)
      | "\($id): \(join(", "))"
    ] as $changed
  | "## compat.json changes\n",
    "| | Records |\n|---|---:|",
    "| Base | \($b | length) |",
    "| Pull request | \($h | length) |",
    "| Added | \($added | length) |",
    "| Removed | \($removed | length) |",
    "| Changed | \($changed | length) |\n",
    section("Added"; $added),
    section("Removed"; $removed),
    section("Changed"; $changed)
'
