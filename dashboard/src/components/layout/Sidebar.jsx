import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils.js';
import {
    LayoutDashboard,
    Settings,
    Users,
    KeyRound,
    Zap,
} from 'lucide-react';
import { useProfileQuery } from '../../hooks/useProfileQuery';
import styles from '../../styles/modules/layout/Sidebar.module.scss';

const navItems = [
    {
        title: 'Overview',
        href: '/',
        icon: LayoutDashboard,
        description: 'Main dashboard view'
    },
];

const ADMIN_ROLES = ['super_admin', 'client_admin'];

const bottomNavItems = [
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'App settings'
    },
];

export function Sidebar({ isOpen, onClose }) {
    const { data: profile } = useProfileQuery();
    const role = profile?.data?.role;
    const isAdmin = ADMIN_ROLES.includes(role);

    const visibleNavItems = [
        ...navItems,
        // Team Management (onboarding orgs/users) has nothing a client_viewer
        // can do, so it's hidden entirely for that role.
        ...(isAdmin
            ? [{
                title: 'Team Management',
                href: '/team',
                icon: Users,
                description: 'Onboard organizations and manage client users'
            }]
            : []),
        // API Management stays visible to every role: creating keys is
        // admin-only, but the backend allows any role to view keys scoped
        // to their own client, including client_viewer.
        {
            title: 'API Management',
            href: '/api-management',
            icon: KeyRound,
            description: 'Issue and review API keys'
        },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className={styles.mobileOverlay}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            <aside
                className={cn(styles.sidebar, !isOpen && styles.closed)}
                aria-label="Sidebar"
                aria-expanded={isOpen}
            >
                <div className={styles.sidebarContainer}>
                    <div className={styles.logoSection}>
                        <div className={cn(styles.logoIcon, 'theme-logo-bg')}>
                            <Zap aria-hidden="true" />
                        </div>
                        <div className={styles.logoText}>
                            <h2 className="theme-text-gradient">API Monitor</h2>
                            <p></p>
                        </div>
                    </div>
                    <nav className={styles.navigation} aria-label="Main navigation">
                        <div className={styles.navList}>
                            {visibleNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.href}
                                        to={item.href}
                                        end={item.href === '/'}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            cn(styles.navLink, isActive && styles.active)
                                        }
                                    >
                                        <Icon aria-hidden="true" />
                                        <div className={styles.navItem}>
                                            <div>{item.title}</div>
                                        </div>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>
                    <div className={styles.bottomNavigation}>
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(styles.navLink, isActive && styles.active)
                                    }
                                >
                                    <Icon aria-hidden="true" />
                                    <div className={styles.navItem}>
                                        <div>{item.title}</div>
                                    </div>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </>
    );
}
