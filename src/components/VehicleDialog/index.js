import React, { useEffect } from 'react';

export default function VehicleDialog({
    name,
    price,
    description,
    media,
    meta,
    dialogRef,
    buttonRef,
    titleRef,
    titleId,
}) {
    useEffect(() => {
        const dialog = dialogRef.current;
        const restoreFocus = () => {
            if (buttonRef.current) buttonRef.current.focus();
        };
        dialog.addEventListener('close', restoreFocus);
        return () => dialog.removeEventListener('close', restoreFocus);
    }, [dialogRef, buttonRef]);

    const metadata = meta || {};
    const emissions = metadata.emissions || {};
    const emissionsTemplate =
        typeof emissions.template === 'string'
            ? emissions.template
            : '$value g/km';
    const details = [
        [
            'Body styles',
            Array.isArray(metadata.bodystyles)
                ? metadata.bodystyles.filter(Boolean).join(', ')
                : '',
        ],
        [
            'Drivetrain',
            Array.isArray(metadata.drivetrain)
                ? metadata.drivetrain.filter(Boolean).join(', ')
                : '',
        ],
        ['Passengers', metadata.passengers],
        [
            'Emissions',
            emissions.value != null
                ? emissionsTemplate.replace('$value', String(emissions.value))
                : null,
        ],
    ].filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
    );
    const image = (media || []).find(
        (item) => item && typeof item.url === 'string',
    );

    return (
        <dialog
            className="vehicle-dialog"
            ref={dialogRef}
            aria-labelledby={titleId}
        >
            <header className="vehicle-dialog__header">
                <div className="vehicle-dialog__title-row">
                    <h2
                        id={titleId}
                        ref={titleRef}
                        tabIndex={-1}
                    >{`${name} details`}</h2>
                    {price && <p className="vehicle-dialog__price">{price}</p>}
                </div>

                <button
                    type="button"
                    className="vehicle-dialog__close"
                    aria-label="Close"
                    onClick={() => dialogRef.current.close()}
                >
                    ×
                </button>
            </header>
            <div className="vehicle-dialog__body">
                <section
                    className="vehicle-dialog__overview"
                    aria-label={`${name} overview`}
                >
                    {image && (
                        <img
                            className="vehicle-dialog__image"
                            src={image.url}
                            alt={`${name} vehicle`}
                        />
                    )}
                    {description && (
                        <p className="vehicle-dialog__description">
                            {description}
                        </p>
                    )}
                </section>
                <section
                    className="vehicle-dialog__specifications"
                    aria-label="Specifications"
                >
                    <h3>Vehicle details</h3>
                    {details.length ? (
                        <dl>
                            {details.map(([label, value]) => (
                                <div key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p>No additional details are available.</p>
                    )}
                </section>
            </div>
        </dialog>
    );
}
