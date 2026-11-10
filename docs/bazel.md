# Bazel package graph

The first child-owned Bazel target is `//crates/mvr-types:types_test`. It compiles the five existing Rust source files of the `mvr-types` crate and runs the crate's existing domain, versioned name, and named type parsing tests. The root module pins Bazel 8.7.0, rules_rust 0.74.0, Rust 1.98.0, and direct dependencies from the committed Cargo.lock for Linux x86-64. In particular, the `sui-sdk-types` spec uses the workspace's requested Git revision `86a9e06`, which Cargo.lock resolves to `86a9e06cde84671e96e776d926a85fc1f229314d`; the lock also contains an unrelated revision of a package with the same name and version.

With Bazel 8.7.0 available, run from this repository root:

```bash
bazel test //crates/mvr-types:types_test --jobs=2 --local_resources=memory=2048
```

The target has no registry, chain, database, or CLI runtime dependency. Initial dependency fetching does require crates.io and the pinned Git source. Cargo remains the native workspace build. This first slice does not compile or test the other MVR crates, Move packages, or web app. A source or lock change must revisit the explicit dependency graph and rerun a fresh-cache test before remote qualification.
