import { useState } from 'react';
import { postJson } from '../lib/landingApi';

export const useWaitlist = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const getAttribution = () => {
        if (typeof window === 'undefined') {
            return {};
        }

        const params = new URLSearchParams(window.location.search);
        const fields = [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'gclid',
            'fbclid',
        ];

        return fields.reduce((attribution, field) => {
            const value = params.get(field);
            return value ? { ...attribution, [field]: value } : attribution;
        }, {
            landingPage: window.location.pathname,
        });
    };

    const submitToWaitlist = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await postJson('/api/send-reservation-email', {
                market: data.market,
                userType: data.userType,
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                location: data.location,
                lookingFor: data.lookingFor,
                newsletterOptIn: Boolean(data.newsletterOptIn),
                attribution: getAttribution(),
            });

            setSuccess(true);
            return { success: true };
        } catch (err) {
            const errorMessage = err.message || 'Failed to reserve your spot. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
        setLoading(false);
    };

    return {
        submitToWaitlist,
        loading,
        error,
        success,
        resetState,
    };
};
