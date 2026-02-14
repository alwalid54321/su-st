
'use client'

import { useState, useEffect } from 'react'

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission)
            // Check for existing subscription
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(sub => {
                    setSubscription(sub)
                })
            })
        }
    }, [])

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications not supported')
            return
        }

        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

            if (!vapidKey) {
                console.error('VAPID public key not found')
                return
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            })

            setSubscription(sub)
            setPermission('granted')

            // Send to server
            await fetch('/api/user/push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            })

            console.log('Push subscription successful')
        } catch (error) {
            console.error('Failed to subscribe to push:', error)
            setPermission('denied')
        } finally {
            setLoading(false)
        }
    }

    return { permission, subscription, subscribeToPush, loading }
}
