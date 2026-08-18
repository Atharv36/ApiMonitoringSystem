import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { clientApi } from '../../api/api';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui';
import { UserPlus } from 'lucide-react';
import styles from '../../styles/modules/team/TeamAccess.module.scss';

const EMPTY_FORM = { username: '', email: '', password: '', role: 'client_viewer' };

export function OnboardUserForm({ isSuperAdmin, clientId, onClientIdChange }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const addToast = useToast();

    const mutation = useMutation({
        mutationFn: () => clientApi.createClientUser(clientId, form),
        onSuccess: (result) => {
            addToast(`User "${result?.data?.username}" onboarded successfully`, 'success');
            setForm(EMPTY_FORM);
        },
        onError: (error) => {
            addToast(error.response?.data?.message || 'Failed to onboard user', 'error');
        },
    });

    const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!clientId) {
            addToast('Client ID is required', 'error');
            return;
        }
        mutation.mutate();
    };

    return (
        <Card>
            <CardHeader>
                <div className={styles.cardTitleRow}>
                    <UserPlus className={styles.cardTitleIcon} aria-hidden="true" />
                    <CardTitle>Onboard Client User</CardTitle>
                </div>
                <CardDescription>Create a login for a user under a client organization</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {isSuperAdmin ? (
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="userClientId">Client ID</label>
                            <Input
                                id="userClientId"
                                value={clientId}
                                onChange={(e) => onClientIdChange(e.target.value)}
                                required
                                placeholder="Paste the organization's Client ID"
                            />
                            <span className={styles.hint}>Copy this from the Onboard Organization section above after creating a client.</span>
                        </div>
                    ) : (
                        <p className={styles.hint}>Creating a user under your own organization.</p>
                    )}
                    <div className={styles.formGrid}>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="newUsername">Username</label>
                            <Input id="newUsername" value={form.username} onChange={handleChange('username')} required />
                        </div>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="newUserEmail">Email</label>
                            <Input id="newUserEmail" type="email" value={form.email} onChange={handleChange('email')} required />
                        </div>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="newUserPassword">Password</label>
                            <Input id="newUserPassword" type="password" value={form.password} onChange={handleChange('password')} required minLength={8} />
                        </div>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="newUserRole">Role</label>
                            <Select id="newUserRole" value={form.role} onChange={handleChange('role')}>
                                <option value="client_viewer">Client Viewer</option>
                                <option value="client_admin">Client Admin</option>
                            </Select>
                        </div>
                    </div>
                    <div className={styles.submitRow}>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Onboarding...' : 'Onboard User'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
