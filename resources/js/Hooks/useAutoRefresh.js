import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function useAutoRefresh(interval = 30000, options = {}) {
    const intervalRef = useRef(null);
    const {
        preserveScroll = true,
        preserveState = false,
        only = [],
        except = [],
        reset = false,
    } = options;

    useEffect(() => {
        // Set up the interval for automatic refreshing
        intervalRef.current = setInterval(() => {
            router.reload({
                preserveScroll,
                preserveState,
                only,
                except,
                reset,
            });
        }, interval);

        // Cleanup function to clear the interval when component unmounts
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [interval, preserveScroll, preserveState, only, except, reset]);

    // Function to manually trigger a refresh
    const refresh = () => {
        router.reload({
            preserveScroll,
            preserveState,
            only,
            except,
            reset,
        });
    };

    // Function to clear the auto-refresh
    const stopAutoRefresh = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Function to restart the auto-refresh
    const startAutoRefresh = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                router.reload({
                    preserveScroll,
                    preserveState,
                    only,
                    except,
                    reset,
                });
            }, interval);
        }
    };

    return { refresh, stopAutoRefresh, startAutoRefresh };
}
