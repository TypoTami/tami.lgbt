import {useEffect, useState} from "react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
};

export function PwaInstallPrompt() {
    const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        function handleBeforeInstallPrompt(event: Event) {
            event.preventDefault();
            setInstallEvent(event as BeforeInstallPromptEvent);
        }

        function handleAppInstalled() {
            setIsInstalled(true);
            setInstallEvent(null);
        }

        const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
        setIsInstalled(isStandalone);

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    async function handleInstallClick() {
        if (!installEvent) {
            return;
        }

        await installEvent.prompt();
        const choice = await installEvent.userChoice;

        if (choice.outcome === "accepted") {
            setInstallEvent(null);
        }
    }

    if (isInstalled || !installEvent) {
        return null;
    }

    return (
        <div className="pwa-install-banner tamiCard">
            <div className="pwa-install-copy">
                <strong>Install this site as an app</strong>
                <p>Add it to your device for a faster, app-like experience.</p>
            </div>

            <button type="button" onClick={handleInstallClick}>
                Add as PWA
            </button>
        </div>
    );
}
