function Loader({ text = 'Loading…' }) {
  return (
    <div className="loader-container">
      <div className="loader-spinner" />
      <span className="loader-text">{text}</span>
    </div>
  );
}

export default Loader;
