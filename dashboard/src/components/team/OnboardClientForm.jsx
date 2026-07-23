import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { clientApi } from '../../api/api';
import { useToast } from '../../contexts/ToastContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui';
import { Building2 } from 'lucide-react';
import styles from '../../styles/modules/team/TeamAccess.module.scss';

const EMPTY_FORM = { name: '', email: '', description: '', website: '' };

export function OnboardClientForm({ onCreated }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const addToast = useToast();

    const mutation = useMutation({
        mutationFn: () => clientApi.createClient(form),
        onSuccess: (result) => {
            const client = result?.data;
            addToast(`Organization "${client?.name}" onboarded successfully`, 'success');
            onCreated?.(client?._id);
            setForm(EMPTY_FORM);
        },
        onError: (error) => {
            addToast(error.response?.data?.message || 'Failed to onboard organization', 'error');
        },
    });

    const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <Card>
            <CardHeader>
                <div className={styles.cardTitleRow}>
                    <Building2 className={styles.cardTitleIcon} aria-hidden="true" />
                    <CardTitle>Onboard Organization</CardTitle>
                </div>
                <CardDescription>Register a new client organization, e.g. Zomato</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="clientName">Organization Name</label>
                            <Input id="clientName" value={form.name} onChange={handleChange('name')} required placeholder="Ex :- Zomato" />
                        </div>
                        <div className={styles.formRow}>
                            <label className={styles.label} htmlFor="clientEmail">Contact Email</label>
                            <Input id="clientEmail" type="email" value={form.email} onChange={handleChange('email')} required placeholder="Ex :- ops@zomato.com" />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="clientDescription">Description (optional)</label>
                        <Input id="clientDescription" value={form.description} onChange={handleChange('description')} placeholder="Ex :- Food delivery platform" />
                    </div>
                    <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="clientWebsite">Website (optional)</label>
                        <Input id="clientWebsite" value={form.website} onChange={handleChange('website')} placeholder="https://zomato.com" />
                    </div>
                    <div className={styles.submitRow}>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Onboarding...' : 'Onboard Organization'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
