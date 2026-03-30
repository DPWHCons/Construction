import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'DPWH';

createInertiaApp({
    title: (title) => `${title} - DPWH`,
    resolve: (name) =>
        resolvePageComponent(
            `../pages/${name}.jsx`,
            import.meta.glob('../pages/**/*.jsx', { eager: true }),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    // progress: {
    //     delay: 250,
    //     color: '#003366',
    //     showSpinner: true,
    // },
    remember: 'search',
});
