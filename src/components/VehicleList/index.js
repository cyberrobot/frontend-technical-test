import React from "react";
import useData from "./useData";
import "./style.scss";
import VehicleCard from "../VehicleCard";

export default function VehicleList() {
    // eslint-disable-next-line no-unused-vars
    const [loading, error, vehicles] = useData();

    if (loading) {
        return <div data-testid="loading">Loading</div>;
    }

    if (error) {
        return <div data-testid="error">{error}</div>;
    }

    return (
        <div data-testid="results">
            <main className="vehicle-list">
                <h1 className="vehicle-list__heading">Our vehicles</h1>
                {vehicles.length === 0 ? (
                    <p>No vehicles are currently available.</p>
                ) : (
                    <ul className="vehicle-list__items">
                        {vehicles.map((vehicle) => (
                            <li className="vehicle-list__item" key={vehicle.id}>
                                <VehicleCard vehicle={vehicle} />
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
