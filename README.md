VizGraph - Interactive DOT Graph Visualizer

VizGraph is a proof of concept web application for interactively visualizing and manipulating Graphviz DOT files. Try it out at [vizgraph.pages.dev](https://vizgraph.pages.dev/)!

## Overview

This project demonstrates interactive visualization of graph structures defined in DOT format, built with modern web technologies:

- **Framework**: SvelteKit 2.0
- **Styling**: TailwindCSS + Skeleton UI
- **Visualization**: D3.js
- **Deployment**: Cloudflare Pages

## Features

- Load and visualize DOT format graph files
- Interactive graph manipulation
- Real-time graph updates

## Development

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Deployment

This project is configured for deployment to Cloudflare Pages. The live version can be found at [vizgraph.pages.dev](https://vizgraph.pages.dev/).

To deploy your own instance:
1. Fork this repository
2. Connect it to Cloudflare Pages
3. Configure the following settings:
    - Build command: `npm run build`
    - Build output directory: `dist`
    - Add the `nodejs_compat` compatibility flag

Alternatively, use the docker image. First pull the image
```shell
docker pull ghcr.io/st2projects/vizgraph:latest
```

Then run it
```shell
docker run -it --name vizgraph -v /path/to/graphviz/json:/data -p 3000:3000 ghcr.io/st2projects/vizgraph
```

## Contributing

This is a proof of concept project, but contributions and suggestions are welcome! Please feel free to:
- Open issues for bugs or feature requests
- Submit pull requests
- Share your feedback

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- UI components from [Skeleton](https://www.skeleton.dev/)
- Visualization powered by [D3.js](https://d3js.org/)