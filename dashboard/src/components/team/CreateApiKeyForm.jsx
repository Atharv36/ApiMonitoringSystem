import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../../api/api';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui';
import { KeyRound } from 'lucide-react';
import { QUERY_KEYS } from '../../constants';
import styles from '../../styles/modules/team/TeamAccess.module.scss';

const EMPTY_FORM = { name: '', description: '', environment: 'production' };

export function CreateApiKeyForm({ isSuperAdmin, clientId, onClientIdChange }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [createdKey, setCreatedKey] = useState(null);
    const addToast = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => clientApi.createApiKey(clientId, form),
        onSuccess: (result) => {
            const key = result?.data;
            setCreatedKey(key);
            addToast(`API key "${key?.name}" created`, 'success');
            setForm(EMPTY_FORM);
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.API_KEYS, clientId] });
        },
        onError: (error) => {
            addToast(error.response?.data?.message || 'Failed to create API key', 'error');
        },
    });

    const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!clientId) {
            addToast('Client ID is required', 'error');
            return;
        }
        setCreatedKey(null);
        mutation.mutate();
    };

    return (
        <Card>
            <CardHeader>
                <div className={styles.cardTitleRow}>
                    <KeyRound className={styles.cardTitleIcon} aria-hidden="true" />
                    <CardTitle>Create API Key</CardTitle>
                </div>
                <CardDescription>Issue an ingest key scoped to a client organization</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {isSuperAdmin ? (
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="keyClientId">Client ID</label>
                            <Input
                                id="keyClientId"
                                value={clientId}
                                onChange={(e) => onClientIdChange(e.target.value)}
                                required
                                placeholder="Paste the organization's Client ID"
                            />
                        </div>
                    ) : (
                        <p className={styles.hint}>Issuing a key for your own organization.</p>
                    )}
                    <div className={styles.formGrid}>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="keyName">Key Name</label>
                            <Input id="keyName" value={form.name} onChange={handleChange('name')} required placeholder="order-service key" />
                        </div>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="keyEnvironment">Environment</label>
                            <Select id="keyEnvironment" value={form.environment} onChange={handleChange('environment')}>
                                <option value="production">Production</option>
                                <option value="staging">Staging</option>
                                <option value="development">Development</option>
                                <option value="testing">Testing</option>
                            </Select>
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="keyDescription">Description (optional)</label>
                        <Input id="keyDescription" value={form.description} onChange={handleChange('description')} placeholder="Used by the order-service ingest middleware" />
                    </div>
                    <div className={styles.submitRow}>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Creating...' : 'Create API Key'}
                        </Button>
                    </div>
                </form>

                {createdKey && (
                    <div className={styles.resultBox}>
                        <p className={styles.resultTitle}>API key created — copy it now</p>
                        <div className={styles.keyValueRow}>
                            <code className={styles.keyValue}>{createdKey.keyValue}</code>
                        </div>
                        <p className={styles.warningNote}>
                            This value is shown only once and cannot be retrieved again after you leave this page.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
