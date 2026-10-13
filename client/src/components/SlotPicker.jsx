import { fmtHour } from '../api';

// One chip per hour. Booked/past hours are disabled; the chosen range is highlighted.
export default function SlotPicker({ openH, closeH, taken, isPast, start, hours, onPick }) {
  const chosen = new Set(start == null ? [] : Array.from({ length: hours }, (_, i) => start + i));
  const hoursList = Array.from({ length: closeH - openH }, (_, i) => openH + i);
  return (
    <div className="slots" role="group" aria-label="Available hours">
      {hoursList.map((h) => {
        const state = taken.has(h) ? 'booked' : isPast(h) ? 'past' : chosen.has(h) ? (h === start ? 'start' : 'range') : 'free';
        return (
          <button type="button" key={h} className={`slot ${state}`} disabled={state === 'booked' || state === 'past'}
            onClick={() => onPick(h)} title={state === 'booked' ? 'Already booked' : state === 'past' ? 'Already passed' : 'Available'}>
            {fmtHour(h)}
          </button>
        );
      })}
    </div>
  );
}
