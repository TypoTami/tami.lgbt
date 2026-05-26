import { useEffect, useState } from "react";

type SensorData = {
    temperature: string;
    humidity: string;
};

export function SensorDisplay() {
    const [data, setData] = useState<SensorData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchSensorData() {
            try {
                const response = await fetch("https://api.tamitech.xyz/", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const parsed = (await response.json()) as SensorData;
                setData(parsed);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }

                console.error(error);
                setError("Failed to load sensor data");
            }
        }

        fetchSensorData();

        return () => {
            controller.abort();
        };
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!data) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <p>Temperature: {data.temperature}°C</p>
            <p>Humidity: {data.humidity}%</p>
        </div>
    );
}