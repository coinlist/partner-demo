_default:
    @just --list --unsorted

# Rebuild the SDK at the given path, pack it, and install that tarball here.
install-from-source sdk:
    #!/usr/bin/env bash
    set -euo pipefail

    sdk_dir="$(cd "{{ sdk }}" 2>/dev/null && pwd)" || {
        echo "error: no such directory: {{ sdk }}" >&2
        exit 1
    }
    [ -f "$sdk_dir/package.json" ] || {
        echo "error: $sdk_dir is not an npm package (no package.json)" >&2
        exit 1
    }

    name="$(node -p "require('$sdk_dir/package.json').name")"
    version="$(node -p "require('$sdk_dir/package.json').version")"
    tarball="$sdk_dir/$(printf '%s' "$name" | sed 's|^@||; s|/|-|g')-$version.tgz"

    echo "==> Packing $name@$version from $sdk_dir"
    ( cd "$sdk_dir" && npm run pack )
    [ -f "$tarball" ] || {
        echo "error: expected $tarball, which npm pack did not produce" >&2
        exit 1
    }

    # Without this npm sees the lockfile integrity of the previous tarball,
    # decides the dependency is already satisfied, and restores the old build
    # instead of the one just packed. That is what makes this work when the
    # version has not changed.
    echo "==> Dropping the stale lockfile integrity for $name"
    node - "$name" <<'NODE'
    const fs = require('node:fs');
    const [, , name] = process.argv;
    const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
    let dropped = 0;
    for (const group of [lock.packages, lock.dependencies]) {
        for (const [key, entry] of Object.entries(group ?? {})) {
            if (key.includes(name) && entry?.integrity !== undefined) {
                delete entry.integrity;
                dropped += 1;
            }
        }
    }
    fs.writeFileSync('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`);
    console.log(`    dropped ${dropped} integrity entr${dropped === 1 ? 'y' : 'ies'}`);
    NODE

    echo "==> Installing the freshly packed tarball"
    rm -rf "node_modules/$name"
    # Relative, so package.json does not pin one developer's home directory.
    spec="file:$(node -e "console.log(require('node:path').relative(process.cwd(), process.argv[1]))" "$tarball")"
    npm install "$spec"

    just verify-install "{{ sdk }}"

# Assert the installed SDK really is the tarball packed from the given path.
verify-install sdk:
    #!/usr/bin/env bash
    set -euo pipefail

    sdk_dir="$(cd "{{ sdk }}" && pwd)"
    name="$(node -p "require('$sdk_dir/package.json').name")"
    version="$(node -p "require('$sdk_dir/package.json').version")"
    tarball="$sdk_dir/$(printf '%s' "$name" | sed 's|^@||; s|/|-|g')-$version.tgz"
    probe="dist/client/index.js"

    packed="$(tar -xzOf "$tarball" "package/$probe" | shasum -a 256 | cut -d' ' -f1)"
    installed="$(shasum -a 256 "node_modules/$name/$probe" | cut -d' ' -f1)"

    # npm reports success whether or not it replaced anything, so this is the
    # only step that can tell a real install from a silently reverted one.
    if [ "$packed" != "$installed" ]; then
        echo "error: node_modules/$name is NOT the tarball that was just packed" >&2
        echo "  packed    $probe  $packed" >&2
        echo "  installed $probe  $installed" >&2
        exit 1
    fi
    echo "==> OK: $name@$version installed from $tarball"

# Everything the demo has to pass: types, deslop, biome, production build.
check:
    npm run check
