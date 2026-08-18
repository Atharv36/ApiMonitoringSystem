import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, PageStatus } from '../components/ui';
import { ThemeSelector } from '../components/ThemeSelector';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { Palette, UserCircle } from 'lucide-react';
import styles from '../styles/modules/pages/PageComponents.module.scss';

const ROLE_LABELS = {
    super_admin: 'Super Admin',
    client_admin: 'Client Admin',
    client_viewer: 'Client Viewer',
};

export function SettingsPage() {
    const { data, isPending, error, refetch } = useProfileQuery();
    const profile = data?.data ?? null;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h2>Settings</h2>
                <p>Manage your preferences</p>
            </div>

            <Card className={styles.sectionCard}>
                <CardHeader>
                    <div className={styles.cardTitleRow}>
                        <UserCircle className={styles.cardTitleIcon} aria-hidden="true" />
                        <CardTitle>User Info</CardTitle>
                    </div>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent>
                    {(isPending || error) && (
                        <PageStatus
                            isLoading={isPending}
                            error={error}
                            onRetry={refetch}
                            loadingText="Loading account details..."
                            errorText="Failed to load account details"
                        />
                    )}
                    {profile && (
                        <div className={styles.formGroup}>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <p>Username</p>
                                    <p>{profile.username}</p>
                                </div>
                            </div>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <p>Email</p>
                                    <p>{profile.email}</p>
                                </div>
                            </div>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <p>Role</p>
                                </div>
                                <Badge variant="secondary">{ROLE_LABELS[profile.role] ?? profile.role}</Badge>
                            </div>
                            {profile.clientId && (
                                <div className={styles.settingRow}>
                                    <div className={styles.settingInfo}>
                                        <p>Client ID</p>
                                        <p>{profile.clientId}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className={styles.sectionCard}>
                <CardHeader>
                    <div className={styles.cardTitleRow}>
                        <Palette className={styles.cardTitleIcon} aria-hidden="true" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeSelector />
                </CardContent>
            </Card>
        </div>
    );
}
