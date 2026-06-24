import { createPortal } from 'react-dom';

export default function TrickPoolModal({
  tricks,
  selectedEvent,
  selectedYear,
  selectedDifficulty,
  onClose,
}) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Active Trick Pool ({tricks.length})</div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            Filters: {selectedEvent} • Year: {selectedYear} • Diff: {selectedDifficulty}
          </div>
          <ul className="modal-list">
            {tricks.map((trick, idx) => (
              <li key={`${trick}-${idx}`} className="modal-item">{idx + 1}. {trick}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
}
