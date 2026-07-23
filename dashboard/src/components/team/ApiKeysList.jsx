import { useQuery } from '@tanstack/react-query';
import { clientApi } from '../../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../ui';
import { ListChecks } from 'lucide-react';
import { QUERY_KEYS } from '../../constants';
import styles from '../../styles/modules/team/TeamAccess.module.scss';

export function ApiKeysList({ clientId }) {
    const { data, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.API_KEYS, clientId],
        queryFn: () => clientApi.getClientApiKeys(clientId),
        enabled: Boolean(clientId),
    });

    const keys = data?.data ?? [];

    return (
        <Card>
            <CardHeader>
                <div className={styles.cardTitleRow}>
                    <ListChecks className={styles.cardTitleIcon} aria-hidden="true" />
                    <CardTitle>Existing API Keys</CardTitle>
                </div>
                <CardDescription>
                    {clientId ? 'Keys issued for this client organization' : "Enter a Client ID above to view its keys"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!clientId && <p className={styles.emptyNote}>No client selected yet.</p>}
                {clientId && isLoading && <p className={styles.emptyNote}>Loading keys...</p>}
                {clientId && error && <p className={styles.emptyNote}>Could not load API keys for this client.</p>}
                {clientId && !isLoading && !error && keys.length === 0 && (
                    <p className={styles.emptyNote}>No API keys created yet for this client.</p>
                )}
                {keys.length > 0 && (
                    <div className={styles.keyList}>
                        {keys.map((key) => (
                            <div key={key._id || key.keyId} className={styles.keyItem}>
                                <div className={styles.keyItemInfo}>
                                    <span className={styles.keyItemName}>{key.name}</span>
                                    <span className={styles.keyItemMeta}>
                                        {key.environment}
                                        {key.createdAt ? ` · created ${new Date(key.createdAt).toLocaleDateString()}` : ''}
                                    </span>
                                </div>
                                <div className={styles.keyItemBadges}>
                                    <Badge variant={key.isActive ? 'success' : 'secondary'}>
                                        {key.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
