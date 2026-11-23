import React from "react";
export default function VehicleCard({ vehicle }) {
    const squareImage = vehicle.media.find((image) =>
        image.url.includes("/1x1/"),
    );
    const wideImage = vehicle.media.find((image) =>
        image.url.includes("/16x9/"),
    );
    const name = vehicle.id.toUpperCase();
    const imageUrl = squareImage
        ? squareImage.url
        : wideImage
          ? wideImage.url
          : undefined;
    const wideImageUrl = wideImage ? wideImage.url : undefined;

    return (
        <article className="vehicle-card">
            <picture className="vehicle-card__image">
                <source media="(min-width: 48rem)" srcSet={wideImageUrl} />
                <img src={imageUrl} alt={name} />
            </picture>

            <div className="vehicle-card__content">
                <h2 className="vehicle-card__name">{name}</h2>
                <p className="vehicle-card__price">From {vehicle.price}</p>
                <p className="vehicle-card__description">
                    {vehicle.description}
                </p>
            </div>
        </article>
    );
}
