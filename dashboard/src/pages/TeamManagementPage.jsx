import { useState } from 'react';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { OnboardClientForm } from '../components/team/OnboardClientForm';
import { OnboardUserForm } from '../components/team/OnboardUserForm';
import { PageStatus } from '../components/ui';
import { getLastClientId, setLastClientId } from '../lib/lastClientId';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function TeamManagementPage() {
    const { data, isPending, error, refetch } = useProfileQuery();
    const profile = data?.data ?? null;
    const [activeClientId, setActiveClientId] = useState(() => getLastClientId());

    if (isPending || error || !profile) {
        return (
            <PageStatus
                isLoading={isPending || !profile}
                error={error}
                onRetry={refetch}
                loadingText="Loading account details..."
                errorText="Failed to load account details"
            />
        );
    }

    if (profile.role === 'client_viewer') {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <h2>Team Management</h2>
                    <p>This section is available to organization admins only.</p>
                </div>
            </div>
        );
    }

    const isSuperAdmin = profile.role === 'super_admin';
    const clientId = isSuperAdmin ? activeClientId : profile.clientId;

    const handleClientIdChange = (value) => {
        setActiveClientId(value);
        setLastClientId(value);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h2>Team Management</h2>
                <p>Onboard organizations and manage client users</p>
            </div>

            {isSuperAdmin && (
                <OnboardClientForm onCreated={(newId) => handleClientIdChange(newId ?? '')} />
            )}

            <OnboardUserForm
                isSuperAdmin={isSuperAdmin}
                clientId={clientId}
                onClientIdChange={handleClientIdChange}
            />
        </div>
    );
}
