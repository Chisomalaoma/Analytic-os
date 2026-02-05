import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
    <button
        type="button"
        aria-pressed={checked}
        style={{
            height: '28px',
            width: '52px',
            minWidth: '52px',
            maxWidth: '52px',
            borderRadius: '14px',
        }}
        className={`relative inline-flex flex-shrink-0 cursor-pointer border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4459FF] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] ${
            checked ? 'bg-[#4459FF]' : 'bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
    >
        <span className="sr-only">Toggle setting</span>
        <span
            style={{
                height: '24px',
                width: '24px',
                borderRadius: '12px',
            }}
            className={`pointer-events-none inline-block transform bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-6' : 'translate-x-0'
            }`}
        />
    </button>
);

export default ToggleSwitch;
