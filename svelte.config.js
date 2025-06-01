import autoAdapter from '@sveltejs/adapter-auto';
import nodeAdapter from '@sveltejs/adapter-node';
import cloudflareAdapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: process.env.ADAPTER === 'node'
            ? nodeAdapter()
            : process.env.ADAPTER === 'cloudflare'
                ? cloudflareAdapter()
                : autoAdapter()
    }
};

export default config;