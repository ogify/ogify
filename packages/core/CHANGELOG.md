# Changelog

# 0.4.0 (2026-01-05)


### Features

* Add `templates` package with a `minimalism` template and introduce generic types for template parameters in core ([c59f776](https://github.com/ogify/ogify/commit/c59f7761c557f0467421443db897378391643169))
* add herculanum font support and update minimal template to use inter ([9c2bc84](https://github.com/ogify/ogify/commit/9c2bc8402f51b317f73863974ffdae86d288edf1))
* add new examples application and update workspace dependencies and lockfile. ([d7e2520](https://github.com/ogify/ogify/commit/d7e2520b2649a48ce96770317fa344fad782041b))
* allow overriding template fonts and emoji provider via render options and support function as template parameters ([b83703e](https://github.com/ogify/ogify/commit/b83703e57646229082e28a8c88b01b4c996322e8))
* **core:** add clsx utility and update template rendering options ([0c2164a](https://github.com/ogify/ogify/commit/0c2164a305ea886812986e90dde9b28ab3189f6f))
* **core:** add LRU caching for template, fonts and icons ([a6fd717](https://github.com/ogify/ogify/commit/a6fd717226ded1b9b36b0bb0d51a1c771c20364a))
* **core:** add LRU caching for template, fonts and icons ([cca6b9d](https://github.com/ogify/ogify/commit/cca6b9de4f50e05c1e181ae255eafe5d65004e76))
* **core:** add RTL support for object-to-style utility ([c7a4d8c](https://github.com/ogify/ogify/commit/c7a4d8c681ae7d0ecb4a671884f2cdaa68f3be87))
* **core:** add RTL support for object-to-style utility ([de6df56](https://github.com/ogify/ogify/commit/de6df56a89e84231f1a1cfd8954b44e830b83a1b))
* **core:** add support for custom fonts via URLs and data ([ca2607f](https://github.com/ogify/ogify/commit/ca2607fcd7a06d3ac1b6b2053563c98f53dfb209))
* **core:** add support for multiple font URLs and integrate template fonts ([fe45bde](https://github.com/ogify/ogify/commit/fe45bdeda0a6d7b60c83c5bfad7514271a1ec16d))
* **core:** enhance renderer with generics and template map ([74afbfa](https://github.com/ogify/ogify/commit/74afbfac1f285b583379de9b8858b1bc24ec9d47))
* **core:** support async parameters in template rendering ([31a26ab](https://github.com/ogify/ogify/commit/31a26abc7c45f92e59bd556875edf85d67816068))
* **core:** support async params and default params in templates ([489304d](https://github.com/ogify/ogify/commit/489304d0cefa2a5e7df3c26bd337efd49bead8c6))
* **examples:** add generation of multiple layout and RTL variants ([97a71d6](https://github.com/ogify/ogify/commit/97a71d6129afbd0fb1d465d5356113ba681cd9ee))
* **examples:** add memory cache, timing logs, and update dependencies ([510a185](https://github.com/ogify/ogify/commit/510a185de47a825da424d6ca5a37e5947ca0c371))
* **examples:** update layout outputs, brand name, and README images ([0861b00](https://github.com/ogify/ogify/commit/0861b00ae202a03bb47a7865788254c3801d6550))
* Implement dynamic Google Font loading by detecting required subsets from text and correctly handling italic styles. ([be39641](https://github.com/ogify/ogify/commit/be396417bee2eaaaa6281c4c4fdc97b229c7acf1))
* initial release of OGify, a type-safe Open Graph image generator with monorepo setup. ([37c11d0](https://github.com/ogify/ogify/commit/37c11d05124c970d04d93f06e2150e967e6aed50))
* Introduce `@ogify/templates` package and enhance `core` renderer with improved type inference for template parameters. ([9d2b07b](https://github.com/ogify/ogify/commit/9d2b07be33aa2eeb53257b192e756bced28bae07))
* Rework API to use HTML-based templates with improved font and emoji support, updating documentation and examples. ([b4f93f4](https://github.com/ogify/ogify/commit/b4f93f45eb3e8010e375979a833c486d17c0ad31))
* **templates:** add call-to-action support and refine layout options in basic template ([b510526](https://github.com/ogify/ogify/commit/b510526197d84f75292219567c1c8c27ea855f22))
* **templates:** add initial templates.json configuration ([98abeb7](https://github.com/ogify/ogify/commit/98abeb7fc54547bf767365febdd654cfe3afcb30))
* **templates:** add RTL support and refactor class handling in basic template ([488a21c](https://github.com/ogify/ogify/commit/488a21c935396106cae88daf83c1015d4492d064))
* **templates:** add RTL support and rename layout option ([3f6ca41](https://github.com/ogify/ogify/commit/3f6ca4111aead3ad77354c15f556327650db9288))
* **templates:** enhance basic template with advanced layout and styling options ([3835719](https://github.com/ogify/ogify/commit/38357199d18feaf6ae10e457e86dc930b7856858))
* **templates:** enhance basic template with layout options and optional subtitle ([47a3c10](https://github.com/ogify/ogify/commit/47a3c10cfce90179f3e4287c690c7227b427a160))
* **templates:** implement basic template ([969f5d0](https://github.com/ogify/ogify/commit/969f5d0a1895dd3ad39f381cc562883d812399b9))
* **templates:** implement minimalism template ([caa7113](https://github.com/ogify/ogify/commit/caa7113cbccb47eb619906da8c6f13cb7f4e6752))
* update default colors in basic template, change example brand name, and refresh example output image. ([126c20b](https://github.com/ogify/ogify/commit/126c20b083882b02aab875f8dddf394a205a0bd3))
* update example application and project README. ([ce3edfe](https://github.com/ogify/ogify/commit/ce3edfe7a71c0bbed58ecae31fb089e1e5da6fd4))
* Update the basic template and its example application. ([a131050](https://github.com/ogify/ogify/commit/a131050d68454806e03599683713abe3e4b2a0b2))


### Performance Improvements

* **core:** add caching to emoji and font loaders ([1aa4297](https://github.com/ogify/ogify/commit/1aa4297db17cad5c35070fb329aa42a839c69a10))

# 0.3.0 (2026-01-05)


### Features

* Add `templates` package with a `minimalism` template and introduce generic types for template parameters in core ([c59f776](https://github.com/ogify/ogify/commit/c59f7761c557f0467421443db897378391643169))
* add herculanum font support and update minimal template to use inter ([9c2bc84](https://github.com/ogify/ogify/commit/9c2bc8402f51b317f73863974ffdae86d288edf1))
* add new examples application and update workspace dependencies and lockfile. ([d7e2520](https://github.com/ogify/ogify/commit/d7e2520b2649a48ce96770317fa344fad782041b))
* allow overriding template fonts and emoji provider via render options and support function as template parameters ([b83703e](https://github.com/ogify/ogify/commit/b83703e57646229082e28a8c88b01b4c996322e8))
* **core:** add clsx utility and update template rendering options ([0c2164a](https://github.com/ogify/ogify/commit/0c2164a305ea886812986e90dde9b28ab3189f6f))
* **core:** add LRU caching for template, fonts and icons ([a6fd717](https://github.com/ogify/ogify/commit/a6fd717226ded1b9b36b0bb0d51a1c771c20364a))
* **core:** add LRU caching for template, fonts and icons ([cca6b9d](https://github.com/ogify/ogify/commit/cca6b9de4f50e05c1e181ae255eafe5d65004e76))
* **core:** add RTL support for object-to-style utility ([c7a4d8c](https://github.com/ogify/ogify/commit/c7a4d8c681ae7d0ecb4a671884f2cdaa68f3be87))
* **core:** add RTL support for object-to-style utility ([de6df56](https://github.com/ogify/ogify/commit/de6df56a89e84231f1a1cfd8954b44e830b83a1b))
* **core:** add support for custom fonts via URLs and data ([ca2607f](https://github.com/ogify/ogify/commit/ca2607fcd7a06d3ac1b6b2053563c98f53dfb209))
* **core:** add support for multiple font URLs and integrate template fonts ([fe45bde](https://github.com/ogify/ogify/commit/fe45bdeda0a6d7b60c83c5bfad7514271a1ec16d))
* **core:** enhance renderer with generics and template map ([74afbfa](https://github.com/ogify/ogify/commit/74afbfac1f285b583379de9b8858b1bc24ec9d47))
* **core:** support async parameters in template rendering ([31a26ab](https://github.com/ogify/ogify/commit/31a26abc7c45f92e59bd556875edf85d67816068))
* **core:** support async params and default params in templates ([489304d](https://github.com/ogify/ogify/commit/489304d0cefa2a5e7df3c26bd337efd49bead8c6))
* **examples:** add generation of multiple layout and RTL variants ([97a71d6](https://github.com/ogify/ogify/commit/97a71d6129afbd0fb1d465d5356113ba681cd9ee))
* **examples:** add memory cache, timing logs, and update dependencies ([510a185](https://github.com/ogify/ogify/commit/510a185de47a825da424d6ca5a37e5947ca0c371))
* **examples:** update layout outputs, brand name, and README images ([0861b00](https://github.com/ogify/ogify/commit/0861b00ae202a03bb47a7865788254c3801d6550))
* Implement dynamic Google Font loading by detecting required subsets from text and correctly handling italic styles. ([be39641](https://github.com/ogify/ogify/commit/be396417bee2eaaaa6281c4c4fdc97b229c7acf1))
* initial release of OGify, a type-safe Open Graph image generator with monorepo setup. ([37c11d0](https://github.com/ogify/ogify/commit/37c11d05124c970d04d93f06e2150e967e6aed50))
* Introduce `@ogify/templates` package and enhance `core` renderer with improved type inference for template parameters. ([9d2b07b](https://github.com/ogify/ogify/commit/9d2b07be33aa2eeb53257b192e756bced28bae07))
* Rework API to use HTML-based templates with improved font and emoji support, updating documentation and examples. ([b4f93f4](https://github.com/ogify/ogify/commit/b4f93f45eb3e8010e375979a833c486d17c0ad31))
* **templates:** add call-to-action support and refine layout options in basic template ([b510526](https://github.com/ogify/ogify/commit/b510526197d84f75292219567c1c8c27ea855f22))
* **templates:** add initial templates.json configuration ([98abeb7](https://github.com/ogify/ogify/commit/98abeb7fc54547bf767365febdd654cfe3afcb30))
* **templates:** add RTL support and refactor class handling in basic template ([488a21c](https://github.com/ogify/ogify/commit/488a21c935396106cae88daf83c1015d4492d064))
* **templates:** add RTL support and rename layout option ([3f6ca41](https://github.com/ogify/ogify/commit/3f6ca4111aead3ad77354c15f556327650db9288))
* **templates:** enhance basic template with advanced layout and styling options ([3835719](https://github.com/ogify/ogify/commit/38357199d18feaf6ae10e457e86dc930b7856858))
* **templates:** enhance basic template with layout options and optional subtitle ([47a3c10](https://github.com/ogify/ogify/commit/47a3c10cfce90179f3e4287c690c7227b427a160))
* **templates:** implement basic template ([969f5d0](https://github.com/ogify/ogify/commit/969f5d0a1895dd3ad39f381cc562883d812399b9))
* **templates:** implement minimalism template ([caa7113](https://github.com/ogify/ogify/commit/caa7113cbccb47eb619906da8c6f13cb7f4e6752))
* update default colors in basic template, change example brand name, and refresh example output image. ([126c20b](https://github.com/ogify/ogify/commit/126c20b083882b02aab875f8dddf394a205a0bd3))
* update example application and project README. ([ce3edfe](https://github.com/ogify/ogify/commit/ce3edfe7a71c0bbed58ecae31fb089e1e5da6fd4))
* Update the basic template and its example application. ([a131050](https://github.com/ogify/ogify/commit/a131050d68454806e03599683713abe3e4b2a0b2))


### Performance Improvements

* **core:** add caching to emoji and font loaders ([1aa4297](https://github.com/ogify/ogify/commit/1aa4297db17cad5c35070fb329aa42a839c69a10))
