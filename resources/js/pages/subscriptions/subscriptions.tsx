import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Subscriptions() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Subscriptions', href: '/subscriptions' },
            ]}
        >
            <Head title="Subscriptions" />
        </AppLayout>
    );
}
