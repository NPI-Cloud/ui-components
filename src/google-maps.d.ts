// Pulls the global `google.maps` namespace into the program. `GoogleMapCanvas` needs it, and so does
// `@googlemaps/js-api-loader`'s own declaration file — without it `importLibrary('maps')` silently
// degrades to an untyped result instead of failing loudly.
//
// It lives here rather than as a `/// <reference>` inside the component because a reference directive
// is copied into the emitted `.d.ts`, which would force every consumer of this package to resolve
// `@types/google.maps` too. Nothing in the public API surface exposes a Google type, so the
// dependency stays a build-time detail of this package.
/// <reference types="google.maps" />
