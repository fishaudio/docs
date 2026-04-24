# Fish Audio Documentation

[![Fish Audio](https://img.shields.io/badge/Fish_Audio-21176d?logo=fishaudio&logoColor=fff&logoSize=auto)](https://fish.audio)
[![License](https://img.shields.io/github/license/fishaudio/docs)](./LICENSE)

This repository contains the source for [Fish Audio's documentation](https://docs.fish.audio).

Fish Audio is an AI platform for voice generation, voice cloning, and audio storytelling. Our technology enables natural-sounding voices for applications across gaming, education, content creation, accessibility, and more.

## Contributing

We welcome contributions! See our [contributing guide](https://docs.fish.audio/contributing) for details on:

- Reporting bugs
- Suggesting enhancements
- Submitting pull requests
- Improving documentation

## Local Development

```bash
npm install
npm run dev
```

### OpenAPI schema

The REST API reference is generated from `api-reference/openapi.json`.
Refresh it from the canonical API schema before validating or deploying docs:

```bash
npm run update:openapi
npm run check:openapi
```

CI also checks pull requests against the latest schema from
`https://api.fish.audio/openapi.json` and opens an automatic update PR when the
schema changes on `main`.

### Commands

- `npm run dev` - Start development server
- `npm run format` - Format files
- `npm run format:check` - Check formatting
- `npm run update:openapi` - Pull the latest OpenAPI schema
- `npm run check:openapi` - Validate the local OpenAPI schema
- `npm run validate` - Refresh OpenAPI schema and validate the Mintlify docs

## Community

- [Discord](https://discord.gg/dF9Db2Tt3Y)
- [GitHub](https://github.com/fishaudio)
- [X (Twitter)](https://x.com/fishaudio)

## Support

- Email: [support@fish.audio](mailto:support@fish.audio)
- [API Status](https://status.fish.audio)
