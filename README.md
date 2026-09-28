# Unistyles Suspense layout repro

A small reading list shows a native layout bug in Unistyles 3.3.0. After React Suspense hides and restores the rows, labels move to the right and values move onto another line.

## Run

Use Node.js 20.19.4 or later and pnpm. iOS needs Xcode, Ruby and Bundler. This app needs a native build and does not run in Expo Go.

```sh
pnpm install --frozen-lockfile
pnpm expo prebuild --platform ios --no-install
bundle install
bundle exec pod install --project-directory=ios
pnpm ios --no-install
```

For Android, use `pnpm android` with an emulator or device available.

The Gemfile pins CocoaPods. `--no-install` keeps Expo from running its automatic CocoaPods installer.

## Reproduce

1. Open the app. Each label and value share one horizontal row.
2. Press **Hide and restore**.
3. Wait one second for the content to return.

Expected: labels stay on the left, with values on the right of the same row.

Actual: row layouts change after the first restore. Press **Reset rows** to mount a fresh set of rows.

## Why this triggers the bug

Every `Layout` instance calls the same dynamic style function. The outer row uses a horizontal layout. Its value container uses a vertical layout with end alignment.

React attaches native refs after rendering the children. By that point, the shared style cache can contain the value container's layout. Unistyles copies that result into the outer row's saved styles and applies it when Suspense restores the row.

The row case needs no navigation, list library, theme switching or data requests. `Gate` reads a promise with React's `use` API to suspend the content for one second.

The [proposed fix](https://github.com/jpudysz/react-native-unistyles/pull/1260) rebuilds each view's styles from its own saved arguments and variants without clearing shared cache invalidation. Native changes require a rebuild. Reloading JavaScript alone does not apply the fix.

## Checked locally

On an iPhone 17 simulator with a Release build, the unpatched row case fails on the first restore. With the native fix, all three labels stay left of their values on the same line through 20 restores. The revised fix also builds for Android arm64. Android runtime checks still need a device or emulator.
