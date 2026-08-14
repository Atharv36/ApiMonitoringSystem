import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../../api/api';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../ui';
import { ListChecks, Trash2 } from 'lucide-react';
import { QUERY_KEYS } from '../../constants';
import styles from '../../styles/modules/team/TeamAccess.module.scss';

export function ApiKeysList({ clientId, canManageKeys }) {
    const addToast = useToast();
    const queryClient = useQueryClient();
    const [confirmingId, setConfirmingId] = useState(null);

    const { data, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.API_KEYS, clientId],
        queryFn: () => clientApi.getClientApiKeys(clientId),
        enabled: Boolean(clientId),
    });

    const keys = data?.data ?? [];

    const deactivateMutation = useMutation({
        mutationFn: (apiKeyId) => clientApi.deactivateApiKey(clientId, apiKeyId),
        onSuccess: () => {
            addToast('API key deactivated', 'success');
            setConfirmingId(null);
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.API_KEYS, clientId] });
        },
        onError: (err) => {
            addToast(err.response?.data?.message || 'Failed to deactivate API key', 'error');
        },
    });

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
                        {keys.map((key) => {
                            const keyId = key._id || key.keyId;
                            const isConfirming = confirmingId === keyId;

                            return (
                                <div key={keyId} className={styles.keyItem}>
                                    <div className={styles.keyItemRow}>
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
                                            {canManageKeys && key.isActive && !isConfirming && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Deactivate ${key.name}`}
                                                    onClick={() => setConfirmingId(keyId)}
                                                >
                                                    <Trash2 className={styles.deleteIcon} aria-hidden="true" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {isConfirming && (
                                        <section className={styles.confirmSection} aria-label="Confirm key deactivation">
                                            <p className={styles.confirmText}>
                                                Deactivate &quot;{key.name}&quot;? Any client using this key will immediately lose ingest access.
                                            </p>
                                            <div className={styles.confirmActions}>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmingId(null)}
                                                    disabled={deactivateMutation.isPending}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deactivateMutation.mutate(keyId)}
                                                    disabled={deactivateMutation.isPending}
                                                >
                                                    {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate Key'}
                                                </Button>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
