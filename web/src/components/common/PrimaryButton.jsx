export default function PrimaryButton({ children, onClick, disabled }) {
    return (
        <button className="primary-button" type="button" onClick={onClick} disabled={disabled}>{children}</button>
    );
}
