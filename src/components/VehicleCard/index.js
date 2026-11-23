import React from 'react';

function getVehicleName(id) {
  const names = {
    fpace: 'F-PACE',
    ftype: 'F-TYPE',
    ipace: 'I-PACE',
  };

  return names[id] || id.toUpperCase();
}

export default function VehicleCard({ vehicle }) {
  const media = Array.isArray(vehicle.media) ? vehicle.media : [];
  const squareImage = media.find((image) => image && typeof image.url === 'string' && image.url.includes('/1x1/'));
  const wideImage = media.find((image) => image && typeof image.url === 'string' && image.url.includes('/16x9/'));
  const fallbackImage = squareImage || wideImage;
  const name = getVehicleName(vehicle.id);
  const wideImageUrl = wideImage ? wideImage.url : undefined;

  return (
    <article className="vehicle-card">
      {fallbackImage ? (
        <picture className="vehicle-card__image">
          {wideImageUrl && <source media="(min-width: 48rem)" srcSet={wideImageUrl} />}
          <img src={fallbackImage.url} alt={`${name} vehicle`} />
        </picture>
      ) : <div className="vehicle-card__image" aria-hidden="true" />}

      <div className="vehicle-card__content">
        <h2 className="vehicle-card__name">
          <span className="vehicle-card__inner-name">{name}</span>
        </h2>
        <p className="vehicle-card__price">
          From
          {' '}
          {vehicle.price}
        </p>
        {vehicle.description && (
        <p className="vehicle-card__description">
          {vehicle.description}
        </p>
        )}
      </div>
    </article>
  );
}
