class Config {
    constructor() {
        this.values = {
            breakpoints: {
                xs: 0,
                sm: 640,
                md: 768,
                lg: 1024,
                xl: 1280,
                '2xl': 1536,
            },
        }

        // After all assets are loaded but before the page is actually ready when ALpine will kick in
        document.addEventListener('readystatechange', () => {
            if (document.readyState === 'interactive' && window.AlpineMagicHelpersConfig) {
                for (const index in window.AlpineMagicHelpersConfig) {
                    this.values[index] = window.AlpineMagicHelpersConfig[index]
                }
            }
        })
    }

    get(property) {
        return this.values[property] ? this.values[property] : null
    }
}

const config = new Config()

export default config
