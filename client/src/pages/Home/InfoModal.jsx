import Modal from '../../components/common/Modal';

function InfoModal({ isOpen, onClose, user }) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personal information">
      <div className="info-grid">
        <div className="info-row">
          <span className="info-label">Name</span>
          <span className="info-value">{user.name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Username</span>
          <span className="info-value">{user.username}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value">{user.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Phone</span>
          <span className="info-value">{user.phone}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Website</span>
          <span className="info-value">{user.website}</span>
        </div>

        <div className="info-section">Address</div>
        <div className="info-row">
          <span className="info-label">Street</span>
          <span className="info-value">
            {user.address?.street}
            {user.address?.suite ? `, ${user.address.suite}` : ''}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">City</span>
          <span className="info-value">
            {user.address?.city} {user.address?.zipcode}
          </span>
        </div>

        {user.company?.name && (
          <>
            <div className="info-section">Company</div>
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{user.company.name}</span>
            </div>
            {user.company.catchPhrase && (
              <div className="info-row">
                <span className="info-label">Tagline</span>
                <span className="info-value">{user.company.catchPhrase}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

export default InfoModal;
