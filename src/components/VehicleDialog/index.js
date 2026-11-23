import React, { useEffect } from 'react';

export default function VehicleDialog({
  name, meta, dialogRef, buttonRef, titleRef, titleId,
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
  const emissionsTemplate = typeof emissions.template === 'string'
    ? emissions.template : '$value g/km';
  const details = [
    ['Body styles', Array.isArray(metadata.bodystyles) ? metadata.bodystyles.filter(Boolean).join(', ') : ''],
    ['Drivetrain', Array.isArray(metadata.drivetrain) ? metadata.drivetrain.filter(Boolean).join(', ') : ''],
    ['Passengers', metadata.passengers],
    ['Emissions', emissions.value != null
      ? emissionsTemplate.replace('$value', String(emissions.value)) : null],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <dialog className="vehicle-dialog" ref={dialogRef} aria-labelledby={titleId}>
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>{`${name} details`}</h2>
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
      <button type="button" className="cta-button" onClick={() => dialogRef.current.close()}>
        Close
      </button>
    </dialog>
  );
}
