
/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    async redirects() {
        return [
            {
                source: "/",
                destination: '/auth',
                permanent: true,
            },
        ]
    },
}

module.exports = nextConfig
