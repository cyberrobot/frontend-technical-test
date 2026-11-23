import React, { useRef } from 'react';
import VehicleDialog from '../VehicleDialog';

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
  const squareImage = media.find(
    (image) => image
            && typeof image.url === 'string'
            && image.url.includes('/1x1/'),
  );
  const wideImage = media.find(
    (image) => image
            && typeof image.url === 'string'
            && image.url.includes('/16x9/'),
  );
  const fallbackImage = squareImage || wideImage;
  const name = getVehicleName(vehicle.id);
  const wideImageUrl = wideImage ? wideImage.url : undefined;
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const titleRef = useRef(null);

  return (
    <article className="vehicle-card">
      {fallbackImage ? (
        <picture className="vehicle-card__image">
          {wideImageUrl && (
            <source
              media="(min-width: 48rem)"
              srcSet={wideImageUrl}
            />
          )}
          <img src={fallbackImage.url} alt={`${name} vehicle`} />
        </picture>
      ) : (
        <div className="vehicle-card__image" aria-hidden="true" />
      )}

      <div className="vehicle-card__content">
        <div className="vehicle-card__details">
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
        <div>
          <button
            className="cta-button vehicle-card__details-button"
            type="button"
            ref={buttonRef}
            aria-label={`View details for ${name}`}
            onClick={() => {
              dialogRef.current.showModal();
              titleRef.current.focus();
            }}
          >
            View details
          </button>
        </div>
      </div>
      <VehicleDialog
        name={name}
        meta={vehicle.meta}
        dialogRef={dialogRef}
        buttonRef={buttonRef}
        titleRef={titleRef}
        titleId={`vehicle-dialog-title-${vehicle.id}`}
      />
    </article>
  );
}
